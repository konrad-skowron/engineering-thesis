import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface Survey {
  title: string;
  questions: Question[];
}

export interface Question {
  question: string;
  type: 'text' | 'multipleChoice';
  options?: string[];
}

export const fetchSurvey = async (surveyId: string): Promise<Survey | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'surveys', surveyId));

    if (docSnap.exists()) {
      return docSnap.data() as Survey;
    }
  } catch (error) {
    console.error('Error fetching survey:', error);
  }
  return null;
};

export const fetchUserSurveys = async (userId: string) => {

};

export const addUserToDb = async (userId: string) => {

};