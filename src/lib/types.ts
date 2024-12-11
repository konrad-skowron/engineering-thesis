export type QuestionType = 'text' | 'number' | 'singleChoice' | 'multipleChoice' | 'dropdownList' | 'discreteScale' | 'continousScale';

export interface Question {
  type: QuestionType;
  question: string;
  required: boolean;
  rangeEnabled?: boolean;
  options?: string[];
}

export interface Survey {
  active: boolean;
  createdAt: Date;
  author: string;
  authorName: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Response {
  [questionIndex: number]: any;
}

export interface Results {
  responses: Response[];
  updatedAt: Date;
}