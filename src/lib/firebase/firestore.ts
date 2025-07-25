import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, getDocs, addDoc, collection, query, where, arrayUnion, deleteDoc, arrayRemove, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { Survey, Question } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';

export const saveSurvey = async (surveyTitle: string, surveyDescription: string, questions: Question[], user : User) : Promise<string> => {
  try {
    const survey: Survey = {
      active: true,
      createdAt: new Date(),
      author: user.uid,
      authorName: user.displayName || user.email || 'Unknown',
      title: surveyTitle,
      description: surveyDescription,
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
    console.error('Error fetching survey: ', error);
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

export const saveSurveyResponse = async (surveyId: string, response: any) => {
  try {;
    const uniqueResponse = { ...response, _id: uuidv4() };
    
    await setDoc(doc(db, 'results', surveyId), {
      responses: arrayUnion(uniqueResponse),
      updatedAt: new Date()
    }, { merge: true });
  } catch (e) {   
    console.error('Error saving survey responses: ', e);
  }
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
      participantsMap[doc.id] = doc.data().responses.length || 0;
    });
    surveyIds.forEach(surveyId => {
      if (!participantsMap[surveyId]) {
        participantsMap[surveyId] = 0;
      }
    });
    return participantsMap;
  } catch (error) {
    console.error('Error fetching all survey responses: ', error);
    return {};
  }
};

export const deleteSurvey = async (surveyId: string, user: User): Promise<boolean> => {
  try {
    const surveyRef = doc(db, 'surveys', surveyId);
    await deleteDoc(surveyRef);

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      surveyIds: arrayRemove(surveyId),
    }, { merge: true });

    const resultsRef = doc(db, 'results', surveyId);
    await deleteDoc(resultsRef);

    return true;
  } catch (e) {
    console.error("Error deleting survey: ", e);
    return false;
  }
};

export const deleteAllUserData = async (user: User) => {
  const surveys = await fetchUserSurveys(user);
  for (const survey of surveys) {
    await deleteSurvey(survey.id, user);
  }
  await deleteDoc(doc(db, 'users', user.uid));
}

export const setSurveyActive = async (surveyId: string, isActive: boolean) => {
  try {
    const surveyRef = doc(db, 'surveys', surveyId);
    await setDoc(surveyRef, {
      active: isActive,
    }, { merge: true });
  } catch (e) {
    console.error("Error opening survey: ", e);
  }
}

export const updateSurvey = async (
  surveyId: string,
  surveyTitle: string,
  surveyDescription: string,
  questions: Question[],
  user: User
): Promise<void> => {
  try {
    const surveyRef = doc(db, 'surveys', surveyId);
    await setDoc(surveyRef, {
      title: surveyTitle,
      description: surveyDescription,
      questions: questions,
      author: user.uid,
      authorName: user.displayName || user.email || 'Unknown',
      updatedAt: new Date(),
    }, { merge: true });
  } catch (e) {
    console.error('Error updating survey: ', e);
  }
};