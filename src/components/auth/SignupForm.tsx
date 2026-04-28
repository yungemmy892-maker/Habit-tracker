'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import Link from 'next/link';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = signUp(email, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error ?? 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🌿</span>
          <h1 className="text-2xl font-bold text-emerald-300 mt-2">Create account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-emerald-400 mb-1">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              data-testid="auth-signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-emerald-900 border border-emerald-700 text-emerald-100 placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-emerald-400 mb-1">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              data-testid="auth-signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-emerald-900 border border-emerald-700 text-emerald-100 placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            data-testid="auth-signup-submit"
            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-emerald-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-300 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
