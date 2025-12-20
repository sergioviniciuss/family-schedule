'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export const SignOutButton = () => {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Sign Out
    </Button>
  );
};

