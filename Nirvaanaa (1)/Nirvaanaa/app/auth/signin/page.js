

"use client";
import React, { useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

export default function SignInPage() {
  const [showCredentials, setShowCredentials] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const params = useSearchParams();
  const errorParam = params.get('error');

  const handleCredentialsSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else if (res?.ok) {
      // Fetch session to get user role
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (session?.user?.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } catch {
        window.location.href = "/dashboard";
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] px-4 py-8 flex flex-col items-center justify-center">
      <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>Welcome to Nirvaanaa</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className={`${inter.className} mb-8 text-lg text-[#7c6a58] italic text-center`}>Step into a world where every sign-in is a verse, and every user is a cherished guest.</motion.p>
      <div className="glassmorphism p-8 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-md">
        {!showCredentials && (
          <>
            <button onClick={() => signIn('google', { callbackUrl: '/' })} className="flex items-center gap-2 bg-[#bfae9e] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7c6a58] transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
  <path fill="#ffffff" d="M43.6 20.4h-1.8V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.3 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-3.6z"/>
  <path fill="#ffffff" d="M6.3 14.7l6.6 4.8C14.3 15.1 18.8 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.3 29.5 4 24 4 16.3 4 9.4 8.4 6.3 14.7z"/>
  <path fill="#ffffff" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.3c-2.1 1.6-4.8 2.6-7.6 2.6-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.4 39.6 16.3 44 24 44z"/>
  <path fill="#ffffff" d="M43.6 20.4h-1.8V20H24v8h11.3c-.9 2.6-2.6 4.8-4.8 6.3l6.5 5.3c4.2-3.9 6.6-9.6 6.6-15.6 0-1.3-.1-2.7-.4-3.6z"/>
</svg>

              Sign in with Google
            </button>
            <button onClick={() => signIn('facebook', { callbackUrl: '/' })} className="flex items-center gap-2 bg-[#bfae9e] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7c6a58] transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
  <path fill="#ffffff" d="M24 4C12.95 4 4 12.95 4 24c0 9.95 7.25 18.2 16.75 19.75V30.9h-5.05v-6.9h5.05v-5.25c0-5 3-7.75 7.5-7.75 2.15 0 4.4.4 4.4.4v4.85h-2.5c-2.45 0-3.2 1.5-3.2 3v3.75h5.45l-.9 6.9h-4.55v12.85C36.75 42.2 44 33.95 44 24c0-11.05-8.95-20-20-20z"/>
</svg>

              Sign in with Facebook
            </button>
            <button onClick={() => setShowCredentials(true)} className="flex items-center gap-2 bg-[#bfae9e] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7c6a58] transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
  <rect x="12" y="20" width="24" height="20" rx="2" fill="#ffffff"/>
  <path fill="#ffffff" d="M24 28a2 2 0 1 0 0 4v4h4v-4a2 2 0 1 0-4-4z"/>
  <path fill="#ffffff" d="M16 20v-4a8 8 0 0 1 16 0v4h-4v-4a4 4 0 0 0-8 0v4z"/>
</svg>

              Sign in with Credentials
            </button>
          </>
        )}
        {showCredentials && (
          <form onSubmit={handleCredentialsSignIn} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="p-2 rounded-lg border"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="p-2 rounded-lg border"
            />
            <button type="submit" disabled={loading} className="bg-[#bfae9e] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#7c6a58] transition">
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button type="button" onClick={() => setShowCredentials(false)} className="text-[#7c6a58] underline">Back</button>
            <Link href="/auth/forgot-password" className="text-[#7c6a58] underline text-sm text-center">
              Forgot Password?
            </Link>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {errorParam && <div className="text-red-500 text-sm text-center">{errorParam}</div>}
          </form>
        )}
      </div>
      <svg width="100%" height="40" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-8">
        <path d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z" fill="#e3e0d9" />
      </svg>
    </main>
  );
}
