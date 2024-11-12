import Dashboard from "@/components/pages/Dashboard";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default function Account() {
  return (
    <Dashboard />
  );
}
