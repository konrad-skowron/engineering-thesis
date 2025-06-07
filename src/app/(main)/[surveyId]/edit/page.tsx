import SurveyCreator from "@/components/pages/SurveyCreator";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit survey'
};

export default function Edit() {
  return (
    <SurveyCreator />
  );
}
