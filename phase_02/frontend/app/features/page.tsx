'use client';

import { motion, useInView } from 'framer-motion';
import { Sparkles, Zap, Shield, Palette } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

export default function FeaturesPage() {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const headerRef = useRef(null);
  const featuresRef = useRef(null);
  const premiumRef = useRef(null);
  const ctaRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, amount: 0.2 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const premiumInView = useInView(premiumRef, { once: true, amount: 0.2 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.2 });

  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-pink-red" />,
      title: "Cinematic UI",
      description: "Every pixel crafted for depth and immersion. Glassmorphic panels with radial glow create a workspace that feels alive — because beautiful tools inspire better work."
    },
    {
      icon: <Zap className="h-8 w-8 text-pink-red" />,
      title: "Lightning Fast",
      description: "Sub-second task operations with optimistic UI updates. SWR-powered caching means your workflow never waits for the network."
    },
    {
      icon: <Shield className="h-8 w-8 text-pink-red" />,
      title: "Bank-Level Security",
      description: "Session-based authentication with bcrypt password hashing. Your credentials and data are encrypted at rest and in transit."
    },
    {
      icon: <Palette className="h-8 w-8 text-pink-red" />,
      title: "Customizable Themes",
      description: "Dark mode perfected with our signature burgundy-noir palette. Every element designed for reduced eye strain during long productive sessions."
    }
  ];

  const premiumFeatures = [
    {
      title: "AI-Powered Insights",
      description: "Machine learning analyzes your task patterns to surface actionable productivity recommendations. Know when you're most focused."
    },
    {
      title: "Team Collaboration",
      description: "Shared workspaces with role-based permissions. Assign tasks, track progress, and celebrate completions together."
    },
    {
      title: "Advanced Analytics",
      description: "Granular productivity reports with exportable data. Track completion rates, priority distributions, and time-to-done metrics."
    }
  ];

  return (
    <div className="min-h-screen bg-deep-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glassmorphic border-b border-pink-red/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Sparkles className="h-6 w-6 text-pink-red group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-bold glow-text">Plannoir</span>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-gray-300 hover:text-pink-red transition-colors">
                Features
              </Link>
              <Link href="/#about" className="text-gray-300 hover:text-pink-red transition-colors">
                About
              </Link>
              <Link href="/#pricing" className="text-gray-300 hover:text-pink-red transition-colors">
                Pricing
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-gray-300 hover:text-pink-red transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-pink-red hover:bg-pink-red/80 rounded-lg font-medium glow-effect transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <motion.div
            ref={headerRef}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-pink-red bg-clip-text text-transparent">
              Powerful Features
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the tools that make Plannoir the premier task management experience
            </p>
          </motion.div>

          {/* Features Grid */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.6,
                  delay: prefersReducedMotion ? 0 : index * 0.1,
                  ease: 'easeInOut'
                }}
                whileHover={{ y: -5 }}
                className="glassmorphic p-8 rounded-xl border border-pink-red/20"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-2 text-pink-red">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Premium Features Section */}
          <motion.div
            ref={premiumRef}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={premiumInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
            className="glassmorphic p-8 rounded-xl border border-pink-red/20 mb-16"
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-pink-red">Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {premiumFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={premiumInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.5,
                    delay: prefersReducedMotion ? 0 : index * 0.1,
                    ease: 'easeInOut'
                  }}
                  className="bg-deep-black/50 p-6 rounded-lg"
                >
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            ref={ctaRef}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
            className="text-center"
          >
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg text-white font-medium text-lg glow-effect hover:scale-105 transition-transform"
            >
              Start Your Free Trial
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
