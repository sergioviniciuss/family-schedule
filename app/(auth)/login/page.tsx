'use client';

import * as React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
              Family Schedule
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Track where you sleep during your trips
            </p>
          </div>

          <div className="flex border-b mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                mode === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                mode === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <LoginForm mode={mode} onModeChange={setMode} />
        </div>
      </div>
    </div>
  );
}

