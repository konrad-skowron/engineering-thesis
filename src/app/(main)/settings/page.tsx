import AccountSettings from '@/components/pages/AccountSettings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings'
};

export default function Settings() {
  return (
    <AccountSettings />
  );
}