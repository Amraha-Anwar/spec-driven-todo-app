'use client';

import { motion } from 'framer-motion';
import { Briefcase, Users, GraduationCap, Heart } from 'lucide-react';

export default function UseCasesPage() {
  const useCases = [
    {
      icon: <Briefcase className="h-10 w-10 text-pink-red" />,
      title: "Professional Productivity",
      description: "Streamline your workday with our intuitive task management system designed for professionals.",
      scenarios: [
        "Project management and team collaboration",
        "Deadline tracking and milestone monitoring",
        "Time allocation and productivity analysis"
      ]
    },
    {
      icon: <Users className="h-10 w-10 text-pink-red" />,
      title: "Team Coordination",
      description: "Coordinate with your team members and keep everyone aligned on project goals.",
      scenarios: [
        "Shared task boards and real-time updates",
        "Role-based access and permissions",
        "Team performance tracking and insights"
      ]
    },
    {
      icon: <GraduationCap className="h-10 w-10 text-pink-red" />,
      title: "Student Organization",
      description: "Keep track of assignments, deadlines, and study schedules in one place.",
      scenarios: [
        "Course schedule management",
        "Assignment deadline tracking",
        "Study session planning and progress"
      ]
    },
    {
      icon: <Heart className="h-10 w-10 text-pink-red" />,
      title: "Personal Wellness",
      description: "Manage your personal goals, habits, and wellness routines effectively.",
      scenarios: [
        "Daily habit tracking and goal setting",
        "Health and fitness milestone monitoring",
        "Mindfulness and self-care scheduling"
      ]
    }
  ];

  const testimonials = [
    {
      quote: "Plannoir transformed how our team manages projects. The cinematic UI makes it enjoyable to use daily.",
      author: "Sarah Johnson, Product Manager"
    },
    {
      quote: "The premium aesthetics combined with powerful features make this the perfect tool for creative professionals.",
      author: "Michael Chen, Creative Director"
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
            Real-World Applications
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how different professionals and teams use Plannoir to achieve their goals
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        {useCases.map((useCase, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`mb-12 ${index % 2 === 0 ? 'md:flex' : 'md:flex md:flex-row-reverse'}`}
          >
            <div className="md:w-1/2 p-6">
              <div className="glassmorphism p-8 rounded-xl border border-pink-red/20 h-full">
                <div className="flex items-center mb-4">
                  {useCase.icon}
                  <h2 className="text-3xl font-bold ml-4 text-pink-red">{useCase.title}</h2>
                </div>
                <p className="text-gray-300 mb-6 text-lg">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.scenarios.map((scenario, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-pink-red mr-2">•</span>
                      <span>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:w-1/2 flex items-center justify-center p-6">
              <div className="bg-gradient-to-br from-pink-red/10 to-transparent border border-pink-red/20 rounded-xl w-full h-64 md:h-80 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="inline-block p-4 rounded-full bg-deep-black/50 border border-pink-red/20 mb-4">
                    {useCase.icon}
                  </div>
                  <p className="text-gray-300">Visual representation of {useCase.title.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="my-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-pink-red">Trusted by Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glassmorphism p-8 rounded-xl border border-pink-red/20">
                <p className="text-xl italic mb-4">"{testimonial.quote}"</p>
                <p className="text-right text-pink-red font-medium">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg text-white font-medium text-lg glow-effect hover:scale-105 transition-transform">
            Get Started Today
          </button>
        </motion.div>
      </div>
    </div>
  );
}