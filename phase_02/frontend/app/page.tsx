'use client';

import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle, BarChart3, Calendar, Zap, Shield, Star, TrendingUp, Users, Target } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { authClient } from '../lib/auth-client';
import { MobileNav } from '../components/layout/mobile-nav';
import { DesktopNav } from '../components/layout/desktop-nav';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await authClient.getSession();
      setSession(data);
    };
    checkSession();
  }, []);

  const dashboardOrSignup = session?.session ? "/dashboard" : "/auth/signup";
  const dashboardOrSignupLabel = session?.session ? "Go to Dashboard" : "Start Organizing Free";

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

            {/* Desktop Navigation */}
            <DesktopNav />

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger Menu */}
              <MobileNav />

              {/* Desktop Auth Buttons (hidden on mobile) */}
              <div className="hidden sm:flex items-center gap-4">
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
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <HeroSection
          dashboardOrSignup={dashboardOrSignup}
          dashboardOrSignupLabel={dashboardOrSignupLabel}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="container mx-auto px-4 py-12 border-t border-white/5"
        >
          <p className="text-center text-xs tracking-[0.3em] uppercase text-gray-500 mb-8">
            Trusted by productive teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['Vercel', 'Linear', 'Raycast', 'Resend', 'Neon'].map((name) => (
              <span key={name} className="text-gray-600 text-lg font-semibold tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <FeaturesSection prefersReducedMotion={prefersReducedMotion} />

        {/* How It Works Section */}
        <HowItWorksSection prefersReducedMotion={prefersReducedMotion} />

        {/* About Section */}
        <AboutSection prefersReducedMotion={prefersReducedMotion} />

        {/* Pricing Section */}
        <PricingSection
          billingPeriod={billingPeriod}
          setBillingPeriod={setBillingPeriod}
          dashboardOrSignup={dashboardOrSignup}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Testimonials Section */}
        <TestimonialsSection prefersReducedMotion={prefersReducedMotion} />

        {/* CTA Section */}
        <CTASection
          dashboardOrSignup={dashboardOrSignup}
          dashboardOrSignupLabel={dashboardOrSignupLabel}
          prefersReducedMotion={prefersReducedMotion}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-pink-red" />
              <span className="font-bold">Plannoir</span>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; 2026 Plannoir. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Hero Section Component
function HeroSection({ dashboardOrSignup, dashboardOrSignupLabel, prefersReducedMotion }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const animationDuration = prefersReducedMotion ? 0 : 0.6;

  return (
    <div ref={ref} className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: animationDuration, ease: 'easeInOut' }}
        >
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
            Organize your workflow with{' '}
            <span className="glow-text text-pink-red">cinematic</span> clarity
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Plannoir is the AI-native task manager built for people who refuse to compromise
            on design. Priority tracking, analytics, and a glassmorphic interface that makes
            every interaction feel intentional.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={dashboardOrSignup}
              className="px-8 py-4 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg text-white font-medium flex items-center justify-center gap-2 glow-effect hover:opacity-90 transition-all group"
            >
              {dashboardOrSignupLabel}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-lg border border-pink-red/50 text-white hover:bg-pink-red/10 transition-colors"
            >
              Learn More
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm text-gray-500 mt-4"
          >
            No credit card required
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="container mx-auto px-4 py-12 border-t border-white/5"
      >
        <p className="text-center text-xs tracking-[0.3em] uppercase text-gray-500 mb-8">
          Trusted by productive teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {['Vercel', 'Linear', 'Raycast', 'Resend', 'Neon'].map((name) => (
            <span key={name} className="text-gray-600 text-lg font-semibold tracking-wide">
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Features Section Component
function FeaturesSection({ prefersReducedMotion }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Smart Task Management",
      description: "Intelligent prioritization and due-date tracking that adapts to your workflow. Organize projects with drag-and-drop simplicity."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Real-time productivity metrics with visual breakdowns. Understand your patterns and optimize your output."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Calendar Integration",
      description: "Seamless date picking with smart scheduling. Never miss a deadline with visual timeline awareness."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Updates",
      description: "Instant synchronization powered by SWR. Every change reflects immediately across your workspace."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Premium Design",
      description: "Hand-crafted glassmorphic interface with depth, glow effects, and cinematic micro-interactions."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Session-based authentication with encrypted storage. Your data stays yours — always."
    }
  ];

  return (
    <div ref={ref} id="features" className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              delay: prefersReducedMotion ? 0 : index * 0.1,
              ease: 'easeInOut'
            }}
            whileHover={{
              scale: 1.05,
              y: -8,
              transition: { duration: 0.3 }
            }}
            className="glassmorphic-3d p-6 rounded-xl border border-pink-red/20 transition-all hover:border-pink-red/40 perspective-container group"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 rounded-lg bg-pink-red/20 border border-pink-red/30 flex items-center justify-center mb-4 text-pink-red glow-strong group-hover:glow-strong"
            >
              {feature.icon}
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// How It Works Section Component
function HowItWorksSection({ prefersReducedMotion }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const steps = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Create",
      description: "Capture tasks instantly with our intuitive interface. Set priorities, due dates, and organize by projects."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Organize",
      description: "Group tasks by priority, project, or timeline. Our smart filters help you focus on what matters most."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Execute",
      description: "Work through your tasks with real-time updates. Check off items and watch your progress visualize instantly."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Track",
      description: "Analyze your productivity patterns with detailed analytics. Understand what works and optimize your workflow."
    }
  ];

  return (
    <div ref={ref} className="container mx-auto px-4 py-20">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 glow-text">
          How It Works
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Four simple steps to mastering your productivity
        </p>

        <div className="relative">
          {/* Animated connecting line */}
          <motion.div
            initial={prefersReducedMotion ? {} : { pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 1.5, ease: 'easeInOut' }}
            className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-red/50 via-pink-red/30 to-transparent hidden md:block"
          />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -20, rotate: -2 }}
                animate={isInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.6,
                  delay: prefersReducedMotion ? 0 : index * 0.2,
                  ease: 'easeInOut'
                }}
                className="relative flex gap-6 items-start"
              >
                <motion.div
                  animate={prefersReducedMotion ? {} : { rotate: [0, 360], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    delay: index * 0.3,
                    ease: 'easeInOut'
                  }}
                  className="shrink-0 w-16 h-16 rounded-full bg-pink-red/20 border-2 border-pink-red/40 flex items-center justify-center text-pink-red glow-strong z-10"
                >
                  {step.icon}
                </motion.div>
                <div className="glassmorphic-3d p-6 rounded-xl border border-pink-red/20 flex-1">
                  <h3 className="text-2xl font-semibold text-pink-red mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// About Section Component
function AboutSection({ prefersReducedMotion }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} id="about" className="container mx-auto px-4 py-20">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, rotate: -2 }}
        animate={isInView ? { opacity: 1, rotate: 0 } : {}}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
        className="max-w-3xl mx-auto"
      >
        <motion.div
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          className="glassmorphic-3d rounded-2xl border border-pink-red/20 p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 glow-text">
            Why Plannoir?
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            Built for people who believe productivity tools should be as refined as the
            work they produce. We rejected the idea that task managers have to look
            bland, feel slow, or treat design as an afterthought.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Every glassmorphic panel, every radial glow, every micro-interaction in
            Plannoir exists because we think the tools you use daily deserve the same
            care as the projects you ship.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Pricing Section Component
function PricingSection({ billingPeriod, setBillingPeriod, dashboardOrSignup, prefersReducedMotion }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const prices = {
    monthly: { free: 0, pro: 9 },
    yearly: { free: 0, pro: 72 } // 20% discount: $9 * 12 * 0.8 = $86.40 ≈ $72
  };

  return (
    <div ref={ref} id="pricing" className="container mx-auto px-4 py-20">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.8,
          type: 'spring',
          bounce: 0.4
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 glow-text">
          Simple, Transparent Pricing
        </h2>
        <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
          Start free and upgrade when you need more power. No hidden fees.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-white font-semibold' : 'text-gray-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-7 bg-pink-red/20 rounded-full border border-pink-red/40 transition-colors hover:bg-pink-red/30"
          >
            <motion.div
              animate={{ x: billingPeriod === 'monthly' ? 2 : 30 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1 w-5 h-5 bg-pink-red rounded-full glow-effect"
            />
          </button>
          <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-white font-semibold' : 'text-gray-400'}`}>
            Yearly
            <span className="ml-1 text-xs text-pink-red">(Save 20%)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <motion.div
            whileHover={{
              scale: 1.02,
              y: -5,
              rotateX: -5,
              transition: { duration: 0.3 }
            }}
            className="glassmorphic-3d rounded-2xl border border-white/10 p-8 flex flex-col perspective-container"
          >
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-gray-400 mb-6">Everything you need to get organized</p>
            <motion.div
              key={billingPeriod}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-4xl font-bold mb-8"
            >
              ${prices[billingPeriod].free}
              <span className="text-lg text-gray-400 font-normal">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
            </motion.div>
            <ul className="space-y-3 mb-8 flex-grow">
              {[
                'Core task management',
                'Priority levels',
                'Calendar date picker',
                'Analytics dashboard',
                'Glassmorphic UI',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="h-5 w-5 text-pink-red shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={dashboardOrSignup}
              className="block text-center px-6 py-3 rounded-lg border border-pink-red/50 text-white hover:bg-pink-red/10 transition-colors font-medium"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Pro Tier */}
          <motion.div
            whileHover={{
              scale: 1.02,
              y: -5,
              rotateX: -5,
              boxShadow: '0 0 40px rgba(201, 66, 97, 0.3)',
              transition: { duration: 0.3 }
            }}
            className="glassmorphic-3d rounded-2xl border border-pink-red/40 p-8 flex flex-col relative glow-effect perspective-container"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-pink-red to-pink-red/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-gray-400 mb-6">For power users and teams</p>
            <motion.div
              key={billingPeriod}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-4xl font-bold mb-8"
            >
              ${prices[billingPeriod].pro}
              <span className="text-lg text-gray-400 font-normal">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
            </motion.div>
            <ul className="space-y-3 mb-8 flex-grow">
              {[
                'Everything in Free',
                'AI-powered insights',
                'Team collaboration',
                'Advanced analytics',
                'Priority support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-300">
                  <Star className="h-5 w-5 text-pink-red shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={dashboardOrSignup}
              className="block text-center px-6 py-3 rounded-lg bg-gradient-to-r from-pink-red to-pink-red/80 text-white font-medium glow-effect hover:opacity-90 transition-all"
            >
              Upgrade to Pro
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Testimonials Section Component
function TestimonialsSection({ prefersReducedMotion }: any) {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "SC",
      quote: "Plannoir transformed how our team tracks deliverables. The analytics alone are worth it."
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      avatar: "MR",
      quote: "Finally, a task manager that doesn't feel like a spreadsheet. The UI is absolutely gorgeous."
    },
    {
      name: "Emily Watson",
      role: "Designer",
      avatar: "EW",
      quote: "The glassmorphic design isn't just beautiful—it actually helps me focus. Game changer."
    },
    {
      name: "David Kim",
      role: "Startup Founder",
      avatar: "DK",
      quote: "We switched our entire company to Plannoir. The productivity gains have been measurable."
    },
    {
      name: "Lisa Park",
      role: "Marketing Lead",
      avatar: "LP",
      quote: "I've tried every task app out there. Plannoir is the only one that combines power with elegance."
    },
    {
      name: "James Miller",
      role: "Freelance Developer",
      avatar: "JM",
      quote: "The real-time sync is flawless. I can trust my tasks are always up-to-date across all devices."
    }
  ];

  // Duplicate for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="container mx-auto px-4 py-20 overflow-hidden">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 glow-text">
          Loved by Professionals
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Join thousands who've elevated their productivity
        </p>

        {/* Desktop: Horizontal Marquee */}
        <div className="hidden sm:block relative">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              x: [0, -50 * testimonials.length + '%']
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="flex gap-6"
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="shrink-0 w-80 glassmorphic-3d p-6 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-pink-red/20 border border-pink-red/40 flex items-center justify-center text-pink-red font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 italic">&ldquo;{testimonial.quote}&rdquo;</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="sm:hidden space-y-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: index * 0.1 }}
              className="glassmorphic-3d p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-pink-red/20 border border-pink-red/40 flex items-center justify-center text-pink-red font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-gray-300 italic">&ldquo;{testimonial.quote}&rdquo;</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// CTA Section Component
function CTASection({ dashboardOrSignup, dashboardOrSignupLabel, prefersReducedMotion }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className="container mx-auto px-4 py-20">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
        className="text-center"
      >
        <motion.div
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          className="glassmorphic-3d rounded-2xl border border-pink-red/20 p-12 glow-effect"
        >
          <h2 className="text-4xl font-bold mb-4 glow-text">
            Ready to elevate your productivity?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto">
            Join the community of professionals who manage their work with precision and style.
          </p>
          <Link
            href={dashboardOrSignup}
            className="inline-flex px-8 py-4 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg text-white font-medium items-center gap-2 glow-effect hover:opacity-90 transition-all group"
          >
            {dashboardOrSignupLabel}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
