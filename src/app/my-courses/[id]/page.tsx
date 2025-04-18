'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Resource {
  type: string;
  title: string;
  url?: string;
  description: string;
}

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: string;
}

interface Module {
  title: string;
  description: string;
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
  
  const [showingAnswers, setShowingAnswers] = useState(false);
  const [feedback, setFeedback] = useState({
    comment: '',
    rating: 0,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // In a real app, this would make an API call
        // For now, we'll just simulate it with a mock response
        setLoading(true);
        
        // Mocked data for now
        setTimeout(() => {
          const mockCourse: Course = {
            _id: courseId,
            userId: 'user123',
            title: 'Web Development Fundamentals',
            description: 'A comprehensive course on web development basics',
            currentLevel: 'Beginner',
            targetSkill: 'Web Development',
            learningPath: {
              modules: [
                {
                  title: 'HTML Essentials',
                  description: 'Learn the fundamentals of HTML structure and elements',
                  resources: [
                    {
                      type: 'article',
                      title: 'HTML Introduction',
                      url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML',
                      description: 'A comprehensive guide to HTML basics by MDN'
                    },
                    {
                      type: 'video',
                      title: 'HTML Crash Course',
                      url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
                      description: 'A quick introduction to HTML elements and structure'
                    }
                  ],
                  assessment: {
                    questions: [
                      {
                        question: 'What does HTML stand for?',
                        options: [
                          'Hyper Text Markup Language',
                          'High Technical Modern Language',
                          'Hyper Transfer Markup Language',
                          'Hybrid Text Making Language'
                        ],
                        correctAnswer: 'Hyper Text Markup Language'
                      },
                      {
                        question: 'Which tag is used to create a paragraph in HTML?',
                        options: ['<paragraph>', '<p>', '<para>', '<text>'],
                        correctAnswer: '<p>'
                      }
                    ]
                  }
                },
                {
                  title: 'CSS Fundamentals',
                  description: 'Learn how to style web pages with CSS',
                  resources: [
                    {
                      type: 'article',
                      title: 'CSS Basics',
                      url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps',
                      description: 'Learn the basics of CSS styling'
                    },
                    {
                      type: 'exercise',
                      title: 'CSS Selectors Practice',
                      url: 'https://flukeout.github.io/',
                      description: 'Interactive game to practice CSS selectors'
                    }
                  ],
                  assessment: {
                    questions: [
                      {
                        question: 'Which property is used to change the text color in CSS?',
                        options: ['text-color', 'font-color', 'color', 'text-style'],
                        correctAnswer: 'color'
                      },
                      {
                        question: 'What CSS property is used to add space between elements?',
                        options: ['spacing', 'margin', 'padding', 'gap'],
                        correctAnswer: 'margin'
                      }
                    ]
                  }
                }
              ]
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            feedback: []
          };
          
          setCourse(mockCourse);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError('Failed to fetch course details. Please try again later.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleModuleChange = (index: number) => {
    setActiveModule(index);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-indigo-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">{error || 'Course not found'}</p>
          <button
            onClick={() => router.push('/my-courses')}
            className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to My Courses
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
            <Link
              href="/my-courses"
              className="text-indigo-600 hover:text-indigo-900"
            >
              &larr; Back to My Courses
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h1 className="text-2xl font-semibold text-gray-900">{course.title}</h1>
              <p className="mt-1 text-sm text-gray-500">{course.description}</p>
              <div className="mt-2 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  Level: {course.currentLevel}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Skill: {course.targetSkill}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Module navigation */}
            <div className="lg:w-1/4">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg sticky top-6">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Modules</h2>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {course.learningPath.modules.map((module, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleModuleChange(index)}
                          className={`w-full text-left px-4 py-3 flex items-center ${
                            activeModule === index
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="mr-2 flex-shrink-0 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium truncate">
                            {module.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Module content */}
            <div className="lg:w-3/4">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-xl font-medium text-gray-900">
                    {course.learningPath.modules[activeModule].title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {course.learningPath.modules[activeModule].description}
                  </p>
                </div>

                {/* Resources */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Resources</h3>
                  <div className="space-y-4">
                    {course.learningPath.modules[activeModule].resources.map((resource, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">{resource.title}</h4>
                            <p className="mt-1 text-sm text-gray-500">{resource.description}</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.type}
                          </span>
                        </div>
                        {resource.url && (
                          <div className="mt-2">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              View Resource &rarr;
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment */}
                {course.learningPath.modules[activeModule].assessment && (
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium text-gray-900">Assessment</h3>
                      <button
                        onClick={handleShowAnswers}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        {showingAnswers ? 'Hide Answers' : 'Show Answers'}
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {course.learningPath.modules[activeModule].assessment?.questions.map((question, qIdx) => (
                        <div key={qIdx} className="border border-gray-200 rounded-md p-4">
                          <h4 className="text-md font-medium text-gray-900 mb-3">
                            {qIdx + 1}. {question.question}
                          </h4>
                          
                          {question.options && (
                            <ul className="space-y-2">
                              {question.options.map((option, oIdx) => (
                                <li key={oIdx} className="flex items-start">
                                  <div className={`
                                    flex-shrink-0 h-5 w-5 border border-gray-300 rounded-full mr-2
                                    ${showingAnswers && option === question.correctAnswer
                                      ? 'bg-green-500 border-green-500' 
                                      : ''
                                    }
                                  `}></div>
                                  <span className={`text-sm ${
                                    showingAnswers && option === question.correctAnswer
                                      ? 'font-medium text-green-700'
                                      : 'text-gray-700'
                                  }`}>
                                    {option}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback form */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Your Feedback</h3>
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="mb-4">
                      <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                        Rate this module:
                      </label>
                      {renderRatingInput()}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                        Your comments:
                      </label>
                      <textarea
                        id="comment"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        value={feedback.comment}
                        onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                        placeholder="What did you like? What could be improved?"
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Submit Feedback
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}