import SurveyForm from "@/components/pages/SurveyForm"
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
    title: surveyTitle
  }
}

export default function SurveyPage(props: Props) {
  return (
    <SurveyForm params={props.params} />
  )
}
