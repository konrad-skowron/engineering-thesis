import { Survey, Response } from "./types";

export const formatTimestamp = (createdAt : any) => {
  const date = new Date(createdAt.seconds * 1000 + Math.floor(createdAt.nanoseconds / 1e6));
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

export const calculateResults = (survey: Survey, responses: Response[], questionIndex: number) => {
  const question = survey?.questions[questionIndex];
  if (!question) return null;

  if (question.type === 'multipleChoice' && question.options) {

    const totalResponses = responses.length;
    const optionCounts = question.options.reduce((acc, option) => {
      const count = responses.filter(a => a[questionIndex] === option).length;
      return {
        ...acc,
        [option]: {
          count,
          percentage: totalResponses ? ((count / totalResponses) * 100).toFixed(1) : '0'
        }
      };
    }, {} as { [key: string]: { count: number; percentage: string } });

    return optionCounts;
  }

  if (question.type === 'text') {
    return responses.map(a => a[questionIndex]).filter(Boolean);
  }

  return null;
};

export const exportToCSV = (survey : Survey, responses : Response[]) => {
  if (!survey) return;

  let csvContent = "data:text/csv;charset=utf-8,";
  
  const headers = ['Response ID', ...survey.questions.map(q => q.question)];
  csvContent += headers.join(',') + '\n';

  responses.forEach((response, index) => {
    const row = [
      index + 1,
      ...survey.questions.map((_, qIndex) => {
        const qResponse = response[qIndex] || '';
        return `"${qResponse.replace(/"/g, '""')}"`;
      })
    ];
    csvContent += row.join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${survey.title}_results.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (survey : Survey, responses : Response[]) => {
  if (!survey) return;

  const data = {
    surveyTitle: survey.title,
    totalResponses: responses.length,
    questions: survey.questions.map((question, index) => ({
      question: question.question,
      type: question.type,
      responses: question.type === 'multipleChoice' ? calculateResults(survey, responses, index) : 
        responses.map(a => a[index]).filter(Boolean)
    }))
  };

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
