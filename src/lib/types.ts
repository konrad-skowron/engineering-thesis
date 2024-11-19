export type QuestionType = 'text' | 'singleChoice' | 'multipleChoice' | 'dropdownList' | 'ranking' | 'discreteScale' | 'continousScale';

export interface Question {
  type: QuestionType;
  question: string;
  required: boolean;
  rangeEnabled: boolean;
  options?: string[];
}

export interface Survey {
  active: boolean;
  createdAt: Date;
  author: string;
  authorName: string;
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