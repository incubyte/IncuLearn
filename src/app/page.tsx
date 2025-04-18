'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  // Redirect to course creation after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/course-creation');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-6">Welcome to IncuLearn</h1>
        
        <p className="text-xl text-gray-700 mb-8">
          Your AI-powered personalized learning platform
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/course-creation"
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Learning Path
          </Link>
          
          <Link
            href="/my-courses"
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View My Courses
          </Link>
        </div>
        
        <p className="text-gray-500 italic">
          Redirecting to Course Creation in a few seconds...
        </p>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-lg mb-3 text-indigo-700">Personalized Learning</h2>
            <p className="text-gray-600">
              AI-generated custom learning paths based on your current skills and goals
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-lg mb-3 text-indigo-700">Adaptive Assessments</h2>
            <p className="text-gray-600">
              Track your progress with tailored assessments at each step of your journey
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-lg mb-3 text-indigo-700">Continuous Feedback</h2>
            <p className="text-gray-600">
              Get constructive feedback to improve your skills and track your growth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}