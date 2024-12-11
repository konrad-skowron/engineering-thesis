import Results from "@/components/pages/Results";
import type { Metadata } from 'next'
import { fetchSurvey } from "@/lib/firebase/firestore";

type Props = {
  params: Promise<{ surveyId: string }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const id = (await params).surveyId
  const survey = await fetchSurvey(id)
  const surveyTitle = survey?.title;
  return {
    title: "Results: " + surveyTitle
  }
}

export default function SurveyResults(props: Props) {
  return (
    <Results params={props.params} />
  );
}
