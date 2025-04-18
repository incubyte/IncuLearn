'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-indigo-600">Loading your courses...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
            <Link
              href="/course-creation"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">You haven't created any courses yet.</p>
                <Link
                  href="/course-creation"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Your First Course
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-medium text-gray-900 mb-2 truncate">{course.title}</h2>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {course.currentLevel}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {course.targetSkill}
                      </span>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      <p>Created on: {new Date(course.createdAt).toLocaleDateString()}</p>
                      <p>{course.learningPath.modules.length} modules</p>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Link
                        href={`/my-courses/${course._id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        View Course &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}