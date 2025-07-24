import NotFound from "@/components/pages/NotFound"
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not found'
};

export default function NotFoundPage() {
  return (
    <NotFound />
  );
}