import AccountSettings from '@/components/AccountSettings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings'
};

export default function Settings() {
  return (
    <AccountSettings />
  );
}