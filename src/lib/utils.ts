import { Survey, Response } from "./types";
import { GoogleGenerativeAI } from '@google/generative-ai'

export const GEMINI_ERROR_MSG = "Error contacting Gemini.";

export const formatTimestamp = (createdAt : any) => {
  const date = new Date(createdAt.seconds * 1000 + Math.floor(createdAt.nanoseconds / 1e6));
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

export const exportToCSV = (survey: Survey, responses: Response[]) => {
  if (!survey) return;

  let csvContent = "\uFEFF";
  const headers = ['ID', ...survey.questions.map(q => `"${q.question}"`)];
  csvContent += headers.join(',') + '\n';

  responses.forEach((response, index) => {
    const row = [
      index + 1,
      ...survey.questions.map((_, questionIndex) => `"${response[questionIndex] || ''}"`)
    ];
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${survey.title}_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const aggregateResults = (survey: Survey, responses: Response[]) => {
  return {
    surveyTitle: survey.title,
    surveyDescription: survey.description,
    participants: responses.length,
    questions: survey.questions.map((question, index) => ({
      question: question.question,
      type: question.type,
      required: question.required,
      options: question.options,
      responses: responses.map(r => r[index])
    }))
  };
};

export const exportToJSON = (survey : Survey, responses : Response[]) => {
  if (!survey) return;

  const data = aggregateResults(survey, responses);
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `${survey.title}_results.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const geminiSummary = async (survey : Survey, responses : Response[]) => {
  if (!survey) return;
  if (!responses || responses.length === 0) return 'No responses yet.';
  if (responses.length > 100) return 'Too many responses.';

  const data = aggregateResults(survey, responses);
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest"});

  const prompt = `
    Provide a one-sentence summary of the main themes and trends from the following survey responses: ${JSON.stringify(data)}
  `;

  try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
  } catch (e) {
      console.error(e);
      return GEMINI_ERROR_MSG;
  }
}
