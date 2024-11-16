import SurveyCreator from "@/components/pages/SurveyCreator";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create a survey'
};

export default function Createt() {
  return (
    <SurveyCreator />
  );
}
