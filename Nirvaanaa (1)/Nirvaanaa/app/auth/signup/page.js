"use client";
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Signup failed');
      // Auto sign-in after signup
      await signIn('credentials', { redirect: false, email, password });
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glassmorphism p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Create your account</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required className="input" />
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" required className="input" />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" required className="input" />
          <button disabled={loading} className="btn-primary w-full py-2">{loading ? 'Creating...' : 'Sign up'}</button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
        <div className="mt-4">
        <button
  onClick={() => signIn('google', { callbackUrl: '/' })}
  className="w-full h-10 rounded btn bg-brand-gold hover:bg-brand-brown text-white flex items-center justify-center gap-2"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
    <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.2 33.6 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.3l6.4-6.4C35.1 5.1 29.8 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"/>
  </svg>
  Sign up with Google
</button>

<button
  onClick={() => signIn('facebook', { callbackUrl: '/' })}
  className="w-full h-10 rounded btn mt-2 bg-brand-gold text-white flex items-center hover:bg-brand-brown justify-center gap-2"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
    <path fill="#fff" d="M24 4C12.95 4 4 12.95 4 24c0 9.95 7.25 18.2 16.75 19.75V30.5h-5v-6.5h5v-5c0-5 3-7.75 7.5-7.75 2.15 0 4.4.4 4.4.4v4.85h-2.5c-2.45 0-3.2 1.5-3.2 3v3.5h5.5l-.9 6.5h-4.6v13.25C36.75 42.2 44 33.95 44 24c0-11.05-8.95-20-20-20z"/>
  </svg>
  Sign up with Facebook
</button>
        </div>
      </div>
    </main>
  );
}
