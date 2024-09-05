import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

export default async function SurveyPage({ params }: { params: { surveyId: string } }) {
  const docSnap = await getDoc(doc(db, 'surveys', params.surveyId));

  if (!docSnap.exists()) {
    notFound();
  }

  return (
    <>
      <div>{JSON.stringify(docSnap.data())}</div>
    </>
  );
}
