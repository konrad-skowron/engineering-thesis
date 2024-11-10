export type QuestionType = 'text' | 'singleChoice' | 'multipleChoice' | 'list' | 'ranking' | 'discreteScale' | 'continousScale';

export interface Question {
  type: QuestionType;
  question: string;
  required: boolean;
  options?: string[];
}

export interface Survey {
  createdAt: Date;
  author: string;
  title: string;
  discription: string;
  questions: Question[];
}

export interface Answer {
  [questionIndex: string]: string;
}

export interface Results {
  answers: Answer[];
  updatedAt: Date;
}