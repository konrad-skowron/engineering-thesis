import Error from "@/components/pages/Error"
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not found'
};

export default function NotFound() {
  return (
    <Error />
  );
}