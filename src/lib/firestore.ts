import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, getDocs, addDoc, collection, query, where, arrayUnion } from "firebase/firestore";
import { User } from "firebase/auth";

export type QuestionType = 'text' | 'singleChoice' | 'multipleChoice' | 'ranking' | 'discreteScale' | 'continousScale';

export interface Question {
  type: QuestionType;
  question: string;
  options?: string[];
}

export interface Survey {
  title: string;
  questions: Question[];
  createdAt: Date;
}

export const saveSurvey = async (surveyTitle: string, questions: Question[], user : User) : Promise<string> => {
  try {
    const survey: Survey = {
      title: surveyTitle,
      questions: questions,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'surveys'), survey);

    await setDoc(doc(db, 'users', user.uid), {
      surveyIds: arrayUnion(docRef.id),
    }, { merge: true });

    return docRef.id
  } catch (e) {
    console.error("Error saving survey: ", e);
  }
  return '';
};

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

export const fetchUserSurveys = async (user : User) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    const surveyIds = userDoc.data().surveyIds || [];
    if (surveyIds.length === 0) {
      return [];
    }

    const surveysQuery = query(collection(db, 'surveys'), where('__name__', 'in', surveyIds));
    const surveysSnapshot = await getDocs(surveysQuery);

    const surveys = surveysSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return surveys;
  } catch (e) {
    console.error('Error fetching user surveys: ', e);
    return [];
  }
};