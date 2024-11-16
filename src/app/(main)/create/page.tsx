import SurveyCreator from "@/components/pages/SurveyCreator";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create a Survey'
};

export default function Createt() {
  return (
    <SurveyCreator />
  );
}
