"use client"
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

const errorMessages = {
  CredentialsSignin: 'Invalid email or password. Please try again.',
  OAuthSignin: 'Could not sign in with social account.',
  default: 'An unexpected error occurred. Please try again or contact support.'
};

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get('error');
  const message = errorMessages[error] || errorMessages.default;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] px-4 py-8">
      <h1 className={`${playfair.className} text-3xl font-bold mb-4 text-[#7c6a58]`}>Sign In Error</h1>
      <div className="glassmorphism p-6 rounded-xl shadow-lg max-w-md w-full text-center">
        <p className={`${inter.className} text-lg text-[#bfae9e] mb-4`}>{message}</p>
        <a href="/auth/signin" className="text-[#7c6a58] underline">Try Again</a>
      </div>
    </main>
  );
}
