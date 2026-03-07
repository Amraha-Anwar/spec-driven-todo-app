'use client';

import { useState, useEffect } from 'react';
import { authClient } from '../lib/auth-client';
import SaaSTEmplate from '../components/ui/saa-s-template';
import { useRouter } from 'next/navigation';
import FeaturesSection from '../components/ui/features-section'
import AboutSection from '@/components/ui/about-section';
import PricingSection from '@/components/ui/pricing-section';
import Footer from '@/components/ui/footer';

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

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleGetStarted = () => {
    if (session?.session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <>
<SaaSTEmplate
      isSignedIn={!!session?.session}
      dashboardLink="/dashboard"
      onSignInClick={handleSignIn}
      onSignUpClick={handleSignUp}
      onGetStartedClick={handleGetStarted}
    />

<FeaturesSection />
<AboutSection />
<PricingSection/>
<Footer />
    </>
  );
}
