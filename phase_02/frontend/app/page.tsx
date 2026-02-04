'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle, BarChart3, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { authClient } from '../lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await authClient.getSession();
      setSession(data);
    };
    checkSession();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-red/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 glassmorphic border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-pink-red" />
              <span className="text-2xl font-bold glow-text">Plannoir</span>
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-300 hover:text-pink-red transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-300 hover:text-pink-red transition-colors">
                About
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-pink-red transition-colors">
                Pricing
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {session?.session ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg font-medium glow-effect hover:opacity-90 transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-2 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg font-medium glow-effect hover:opacity-90 transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glassmorphic rounded-full px-4 py-2 mb-6 border border-pink-red/20"
          >
            <Sparkles className="h-4 w-4 text-pink-red" />
            <span className="text-pink-red">Premium Task Management</span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Transform Your Tasks Into{' '}
            <span className="glow-text text-pink-red">Cinematic</span> Reality
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Plannoir brings premium, glassmorphic aesthetics to your task management. 
            Experience productivity with style, priority management, and beautiful analytics.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={session?.session ? "/dashboard" : "/auth/signup"}
              className="px-8 py-4 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg text-white font-medium flex items-center justify-center gap-2 glow-effect hover:opacity-90 transition-all group"
            >
              {session?.session ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-lg border border-pink-red/50 text-white hover:bg-pink-red/10 transition-colors"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          id="features"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="Smart Task Management"
            description="Create, edit, and organize tasks with priority levels and due dates"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Analytics Dashboard"
            description="Track your productivity with beautiful charts and insights"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Calendar Integration"
            description="Schedule tasks with an intuitive calendar picker"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Real-time Updates"
            description="Instant synchronization across all your devices"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Premium Design"
            description="Glassmorphic UI with radial glows and 3D effects"
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="Secure & Private"
            description="Your data is encrypted and protected"
          />
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-32 text-center"
        >
          <div className="glassmorphic rounded-2xl border border-pink-red/20 p-12 glow-effect">
            <h2 className="text-4xl font-bold mb-4 glow-text">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who manage their tasks with style
            </p>
            <Link
              href={session?.session ? "/dashboard" : "/auth/signup"}
              className="inline-flex px-8 py-4 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg text-white font-medium items-center gap-2 glow-effect hover:opacity-90 transition-all group"
            >
              {session?.session ? "Go to Dashboard" : "Start Free Today"}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-pink-red" />
              <span className="font-bold">Plannoir</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 Plannoir. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="glassmorphic p-6 rounded-xl border border-pink-red/20 transition-all hover:border-pink-red/40 hover:glow-effect"
    >
      <div className="w-12 h-12 rounded-lg bg-pink-red/20 border border-pink-red/30 flex items-center justify-center mb-4 text-pink-red">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}