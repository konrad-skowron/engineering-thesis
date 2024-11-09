import { LandingPage } from '@/components/LandingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Survey Maker: Create surveys with ease'
  }
};

export default function Home() {
  return (
    <LandingPage />
  );
}