import { Survey, Answer } from "./types";

export const formatTimestamp = (createdAt : any) => {
  const date = new Date(createdAt.seconds * 1000 + Math.floor(createdAt.nanoseconds / 1e6));
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

export const copyLink = () => {
  const link = window.location.href;
  navigator.clipboard.writeText(link);
  alert('Link copied to clipboard');
};

export const calculateResults = (survey: Survey, answers: Answer[], questionIndex: number) => {
  const question = survey?.questions[questionIndex];
  if (!question) return null;

  if (question.type === 'multipleChoice' && question.options) {

    const totalResponses = answers.length;
    const optionCounts = question.options.reduce((acc, option) => {
      const count = answers.filter(a => a[questionIndex] === option).length;
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
    return answers.map(a => a[questionIndex]).filter(Boolean);
  }

  return null;
};

export const exportToCSV = (survey : Survey, answers : Answer[]) => {
  if (!survey) return;

  let csvContent = "data:text/csv;charset=utf-8,";
  
  const headers = ['Response ID', ...survey.questions.map(q => q.question)];
  csvContent += headers.join(',') + '\n';

  answers.forEach((answer, index) => {
    const row = [
      index + 1,
      ...survey.questions.map((_, qIndex) => {
        const response = answer[qIndex] || '';
        return `"${response.replace(/"/g, '""')}"`;
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

export const exportToJSON = (survey : Survey, answers : Answer[]) => {
  if (!survey) return;

  const data = {
    surveyTitle: survey.title,
    totalResponses: answers.length,
    questions: survey.questions.map((question, index) => ({
      question: question.question,
      type: question.type,
      responses: question.type === 'multipleChoice' ? calculateResults(survey, answers, index) : 
        answers.map(a => a[index]).filter(Boolean)
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
