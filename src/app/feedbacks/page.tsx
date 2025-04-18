'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Feedback {
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export default function Feedbacks() {
  // Temporary user ID for now (will be replaced with auth)
  const tempUserId = 'user123';
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now - in a real app, we would fetch from API
    const mockFeedbacks: Feedback[] = [
      {
        courseId: '1',
        courseTitle: 'Web Development Fundamentals',
        moduleTitle: 'HTML Basics',
        comment: 'The content was clear and well-structured. I learned a lot!',
        rating: 5,
        createdAt: new Date().toISOString(),
      },
      {
        courseId: '2',
        courseTitle: 'JavaScript Mastery',
        moduleTitle: 'Advanced Functions',
        comment: 'Some concepts were difficult to grasp. More examples would be helpful.',
        rating: 3,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
    ];
    
    // Simulate API call
    setTimeout(() => {
      setFeedbacks(mockFeedbacks);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-indigo-600">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Helper function to render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-5 w-5 ${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Feedback & Assessments</h1>

          {feedbacks.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6 text-center">
                <p className="text-gray-600">You don't have any feedback yet.</p>
                <p className="text-gray-600 mt-2">
                  Complete some course modules to receive feedback and track your progress.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Recent Feedback</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review feedback from your completed course modules.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {feedbacks.map((feedback, index) => (
                    <li key={index} className="px-4 py-5 sm:px-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">{feedback.courseTitle}</h3>
                          <p className="text-sm text-gray-500">Module: {feedback.moduleTitle}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mt-2">{renderStars(feedback.rating)}</div>
                      
                      <p className="mt-2 text-sm text-gray-600">{feedback.comment}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}