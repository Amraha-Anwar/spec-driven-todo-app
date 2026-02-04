'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '../../../lib/auth-client';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../../lib/toast';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const checkSession = async () => {
      const { data } = await authClient.getSession();
      if (data?.session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/dashboard',
      });

      if (authError) {
        toast.error(authError.message || 'Invalid email or password');
      } else {
        toast.success('Welcome back!');
        
        // ✅ REDIRECTION FIX: 
        // Using window.location.href instead of router.push ensures that 
        // the browser session and cookies are fully synchronized before landing on the dashboard.
        window.location.href = '/dashboard';
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-red/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Sign In Form */}
      <div className="w-full max-w-md glassmorphic p-8 rounded-2xl border border-pink-red/20 glow-effect relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="h-8 w-8 text-pink-red" />
          <h1 className="text-3xl font-bold glow-text">Plannoir</h1>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 focus:ring-2 focus:ring-pink-red/20 outline-none transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 focus:ring-2 focus:ring-pink-red/20 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-red to-pink-red/80 text-white font-bold rounded-lg glow-effect hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-pink-red hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-pink-red transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}