'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Resource {
  type: string;
  title: string;
  url?: string;
  description: string;
  estimatedMinutes?: string;
}

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: string;
}

interface Module {
  title: string;
  description: string;
  estimatedHours?: string;
  resources: Resource[];
  assessment?: {
    questions: Question[];
  };
}

interface Course {
  _id: string;
  userId: string;
  title: string;
  description: string;
  currentLevel: string;
  targetSkill: string;
  learningPath: {
    modules: Module[];
    estimatedTotalHours?: string;
  };
  createdAt: string;
  updatedAt: string;
  feedback?: Array<{
    moduleIndex: number;
    comment: string;
    rating: number;
    createdAt: string;
  }>;
}

export default function CourseDetail() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState(0);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [showingAnswers, setShowingAnswers] = useState(false);
  const [feedback, setFeedback] = useState({
    comment: '',
    rating: 0,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log('Fetching course with ID:', courseId);
        
        // Fetch from a different route - fetch a single course by ID
        // This should point to an API route that gets course by courseId, not userId
        const response = await axios.get(`/api/course/${courseId}`);
        
        console.log('Course response:', response.data);
        
        // Nested data structure from API
        setCourse(response.data.data?.course);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch course details. Please try again later.');
        console.error('Error fetching course:', err);
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleDeleteCourse = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/course/${courseId}`);
      router.push('/my-courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
      setDeleting(false);
    }
  };

  const handleModuleChange = (index: number) => {
    setActiveModule(index);
    setExpandedModule(index);
    setShowingAnswers(false);
  };

  const handleShowAnswers = () => {
    setShowingAnswers(!showingAnswers);
  };

  const handleRatingChange = (rating: number) => {
    setFeedback({ ...feedback, rating });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.comment || feedback.rating === 0) {
      alert('Please provide both a comment and rating');
      return;
    }
    
    try {
      // In a real app, this would call the API
      // For now, we'll just simulate success
      alert('Feedback submitted successfully!');
      setFeedback({ comment: '', rating: 0 });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Render star rating input
  const renderRatingInput = () => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="p-1"
          >
            <svg
              className={`h-6 w-6 ${
                feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-indigo-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => router.push('/my-courses')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/my-courses"
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 hover:-translate-x-0.5 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to My Courses
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 hover:translate-x-0.5 transition-transform"
            >
              <TrashIcon className="w-5 h-5" />
              Delete Course
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6"
          >
            <div className="px-6 py-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {course.title}
              </h1>
              <p className="mt-4 text-gray-600 text-lg">{course.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Level: {course.currentLevel}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Skill: {course.targetSkill}
                </span>
                {course.learningPath.estimatedTotalHours && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg 
                      className="w-4 h-4 mr-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    Estimated: {course.learningPath.estimatedTotalHours} hours
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Module navigation */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/4"
            >
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden sticky top-6">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Modules</h2>
                </div>
                <nav className="p-4">
                  {course.learningPath.modules.map((module, index) => (
                    <button
                      key={index}
                      onClick={() => handleModuleChange(index)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeModule === index
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">Module {index + 1}</span>
                      <p className={`text-sm ${activeModule === index ? 'text-white/90' : 'text-gray-500'}`}>
                        {module.title}
                      </p>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Module content */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-3/4"
            >
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                  {course.learningPath.modules.map((module, index) => (
                    activeModule === index && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6"
                      >
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {module.title}
                        </h2>
                        
                        {module.estimatedHours && (
                          <div className="flex items-center gap-2 text-indigo-600 font-medium mb-2">
                            <svg 
                              className="w-5 h-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                              />
                            </svg>
                            <span>Estimated time: {module.estimatedHours} hours</span>
                          </div>
                        )}
                        
                        <p className="text-gray-600 mb-8">{module.description}</p>

                        {module.resources.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {module.resources.map((resource, rIndex) => (
                                <motion.div
                                  key={rIndex}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: rIndex * 0.1 }}
                                  className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                  {resource.url ? (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-700 font-medium block mb-2"
                                    >
                                      {resource.title}
                                    </a>
                                  ) : (
                                    <h4 className="font-medium text-gray-900 mb-2">{resource.title}</h4>
                                  )}
                                  <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                                  
                                  {resource.estimatedMinutes && (
                                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-2">
                                      <svg 
                                        className="w-4 h-4" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                                        />
                                      </svg>
                                      <span>{resource.estimatedMinutes} minutes</span>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {module.assessment && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment</h3>
                            <div className="space-y-6">
                              {module.assessment.questions.map((question, qIndex) => (
                                <div key={qIndex} className="bg-gray-50 rounded-xl p-6">
                                  <p className="text-gray-900 font-medium mb-4">{question.question}</p>
                                  {question.options && (
                                    <div className="space-y-2">
                                      {question.options.map((option, oIndex) => (
                                        <div
                                          key={oIndex}
                                          className={`p-3 rounded-lg ${
                                            showingAnswers && option === question.correctAnswer
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-white text-gray-600'
                                          }`}
                                        >
                                          {option}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => setShowingAnswers(!showingAnswers)}
                              className="mt-6 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                              {showingAnswers ? 'Hide Answers' : 'Show Answers'}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Course</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this course? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      Delete Course
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}