import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, getDocs, addDoc, collection, query, where, arrayUnion } from "firebase/firestore";
import { User } from "firebase/auth";
import { Survey, Question, Answer } from "@/lib/types";

export const saveSurvey = async (surveyTitle: string, surveyDescription: string, questions: Question[], user : User) : Promise<string> => {
  try {
    const survey: Survey = {
      createdAt: new Date(),
      author: user.uid,
      title: surveyTitle,
      discription: surveyDescription,
      questions: questions
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

export const fetchUserSurveys = async (user : User): Promise<any[]> => {
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

export const saveSurveyAnswers = async (surveyId: string, answers: any) => {
  try {
    await setDoc(doc(db, 'results', surveyId), {
      answers: arrayUnion(answers),
      updatedAt: new Date()
    }, { merge: true });
  } catch (e) {   
    console.error('Error saving survey answers: ', e);
  }
};

export const fetchSurveyAnswers = async (surveyId: string): Promise<Answer[]> => {
  try {
    const docSnap = await getDoc(doc(db, 'results', surveyId));

    if (docSnap.exists()) {
      return docSnap.data().answers || [];
    }
  } catch (error) {
    console.error('Error fetching survey answers:', error);
  }
  return [];
};

export const fetchAllSurveyParticipants= async (surveyIds: string[]): Promise<Record<string, number>> => {
  if (surveyIds.length === 0) {
    return {};
  }
  try {
    const resultsQuery = query(collection(db, 'results'), where('__name__', 'in', surveyIds));
    const resultsSnapshot = await getDocs(resultsQuery);

    const participantsMap: Record<string, number> = {};
    resultsSnapshot.forEach(doc => {
      participantsMap[doc.id] = doc.data().answers.length || 0;
    });
    surveyIds.forEach(surveyId => {
      if (!participantsMap[surveyId]) {
        participantsMap[surveyId] = 0;
      }
    });
    return participantsMap;
  } catch (error) {
    console.error('Error fetching all survey answers:', error);
    return {};
  }
};

