'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, BookOpenIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Resource {
  type: string;
  title: string;
  url?: string;
  description: string;
}

interface Module {
  title: string;
  description: string;
  resources: Resource[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  currentLevel: string;
  targetSkill: string;
  learningPath: {
    modules: Module[];
  };
  createdAt: string;
}

export default function MyCourses() {
  // Temporary user ID for now (will be replaced with auth)
  const tempUserId = 'user123';
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`/api/course?userId=${tempUserId}`);
        setCourses(response.data.courses || []);
      } catch (err) {
        setError('Failed to fetch your courses. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Loading your courses...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg font-medium text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-between items-center"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              My Courses
            </h1>
            <Link
              href="/course-creation"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create New Course
            </Link>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {courses.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl"
            >
              <div className="p-12 text-center">
                <BookOpenIcon className="w-16 h-16 mx-auto mb-6 text-indigo-600" />
                <p className="text-xl text-gray-600 mb-8">You haven't created any courses yet.</p>
                <Link
                  href="/course-creation"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Your First Course
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {courses.map((course) => (
                <motion.div
                  key={course._id}
                  variants={item}
                  className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 mb-6 line-clamp-2">{course.description}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {course.currentLevel}
                      </span>
                      <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {course.targetSkill}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5" />
                        <span>Created on: {new Date(course.createdAt).toLocaleDateString()} at {new Date(course.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5" />
                        <span>{course.learningPath.modules.length} modules</span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/my-courses/${course._id}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium group-hover:translate-x-1 transition-transform duration-200"
                    >
                      View Course
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}