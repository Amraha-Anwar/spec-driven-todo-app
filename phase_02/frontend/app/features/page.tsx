'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Palette } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-pink-red" />,
      title: "Cinematic UI",
      description: "Experience our premium glassmorphism design with radial glow effects that create an immersive environment for your tasks."
    },
    {
      icon: <Zap className="h-8 w-8 text-pink-red" />,
      title: "Lightning Fast",
      description: "Optimized for speed and performance with instant task updates and smooth animations."
    },
    {
      icon: <Shield className="h-8 w-8 text-pink-red" />,
      title: "Bank-Level Security",
      description: "Your data is protected with end-to-end encryption and secure authentication protocols."
    },
    {
      icon: <Palette className="h-8 w-8 text-pink-red" />,
      title: "Customizable Themes",
      description: "Personalize your workspace with our extensive theme customization options."
    }
  ];

  const premiumFeatures = [
    {
      title: "AI-Powered Insights",
      description: "Get intelligent suggestions and insights based on your task patterns."
    },
    {
      title: "Team Collaboration",
      description: "Work seamlessly with your team members in real-time."
    },
    {
      title: "Advanced Analytics",
      description: "Track your productivity with detailed analytics and reports."
    }
  ];

  return (
    <div className="min-h-screen bg-deep-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-pink-red bg-clip-text text-transparent">
            Powerful Features
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the tools that make Plannoir the premier task management solution
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glassmorphism p-8 rounded-xl border border-pink-red/20"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-2 text-pink-red">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Premium Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glassmorphism p-8 rounded-xl border border-pink-red/20 mb-16"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-pink-red">Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="bg-deep-black/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg text-white font-medium text-lg glow-effect hover:scale-105 transition-transform">
            Start Your Free Trial
          </button>
        </motion.div>
      </div>
    </div>
  );
}