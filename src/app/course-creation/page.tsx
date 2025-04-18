'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

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

interface LearningPath {
  modules: Module[];
}

interface Course {
  _id: string;
  userId: string;
  title: string;
  description: string;
  currentLevel: string;
  targetSkill: string;
  learningPath: LearningPath;
  createdAt: string;
  updatedAt: string;
}

export default function CourseCreation() {
  // Temporary user ID for now (will be replaced with auth)
  const tempUserId = 'user123';
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'details' | 'chat'>('intro');
  const [courseDetails, setCourseDetails] = useState({
    title: '',
    description: '',
    currentLevel: '',
    targetSkill: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartCourse = () => {
    setCurrentStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseDetails.title || !courseDetails.description || 
        !courseDetails.currentLevel || !courseDetails.targetSkill) {
      alert('Please fill in all fields');
      return;
    }
    
    setCurrentStep('chat');
    
    // Add initial message
    const initialMessage: Message = {
      role: 'assistant',
      content: `I'll help you create a personalized learning path for "${courseDetails.targetSkill}" based on your current level (${courseDetails.currentLevel}). Tell me more about your specific goals and what you'd like to achieve with this skill.`
    };
    
    setMessages([initialMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // If we have 5 messages (including the initial one), it's time to generate the course
      if (messages.length >= 4) {
        // Create the course with the full conversation
        const response = await axios.post('/api/course', {
          userId: tempUserId,
          title: courseDetails.title,
          description: courseDetails.description,
          currentLevel: courseDetails.currentLevel,
          targetSkill: courseDetails.targetSkill,
          conversation: [...messages, userMessage],
        });

        setCourse(response.data.course);
        
        const finalMessage: Message = {
          role: 'assistant',
          content: 'I\'ve created your personalized learning path based on our conversation. You can now view it in the right panel. Feel free to explore each module and begin your learning journey!'
        };
        
        setMessages((prev) => [...prev, finalMessage]);
      } else {
        // Just a regular conversation message
        const assistantMessage: Message = {
          role: 'assistant',
          content: 'Thank you for sharing. Can you tell me more about your background with this topic and any specific challenges you\'ve faced?'
        };
        
        // In a real app, you would call API here for real responses
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error generating your course. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Course Creation</h1>
          
          {currentStep === 'intro' && (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Welcome to IncuLearn</h2>
              <p className="text-gray-600 mb-4">
                Our AI will help you create a personalized learning path based on your current skill
                level and learning goals. You'll chat with our AI assistant to determine your needs,
                and we'll generate a custom curriculum just for you.
              </p>
              <button
                onClick={handleStartCourse}
                className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Learning Path
              </button>
            </div>
          )}
          
          {currentStep === 'details' && (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Course Details</h2>
              <form onSubmit={handleDetailsSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Course Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={courseDetails.title}
                    onChange={(e) => setCourseDetails({ ...courseDetails, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Web Development Fundamentals"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Course Description
                  </label>
                  <textarea
                    id="description"
                    value={courseDetails.description}
                    onChange={(e) => setCourseDetails({ ...courseDetails, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="A brief description of what you want to learn"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-700">
                    Your Current Level
                  </label>
                  <select
                    id="currentLevel"
                    value={courseDetails.currentLevel}
                    onChange={(e) => setCourseDetails({ ...courseDetails, currentLevel: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select your level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="targetSkill" className="block text-sm font-medium text-gray-700">
                    Target Skill
                  </label>
                  <input
                    type="text"
                    id="targetSkill"
                    value={courseDetails.targetSkill}
                    onChange={(e) => setCourseDetails({ ...courseDetails, targetSkill: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., JavaScript, Machine Learning, Public Speaking"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue
                </button>
              </form>
            </div>
          )}
          
          {currentStep === 'chat' && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Chat section */}
              <div className="lg:w-1/2 bg-white overflow-hidden shadow rounded-lg">
                <div className="p-4 h-[600px] flex flex-col">
                  <div className="flex-1 overflow-y-auto mb-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <form onSubmit={handleSubmit} className="mt-auto">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Type your message..."
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading}
                      >
                        {loading ? 'Thinking...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Learning path section */}
              <div className="lg:w-1/2 bg-white overflow-hidden shadow rounded-lg">
                <div className="p-4 h-[600px] overflow-y-auto">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">
                    {course ? 'Your Learning Path' : 'Learning Path Preview'}
                  </h2>
                  
                  {!course ? (
                    <div className="text-gray-500 italic">
                      Chat with our AI to generate your personalized learning path. It will appear here once created.
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                        <p className="text-gray-600 mt-1">{course.description}</p>
                        <div className="mt-2 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            Level: {course.currentLevel}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Skill: {course.targetSkill}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {course.learningPath.modules.map((module, moduleIndex) => (
                          <div key={moduleIndex} className="border border-gray-200 rounded-md p-4">
                            <h4 className="text-md font-medium text-gray-900">
                              Module {moduleIndex + 1}: {module.title}
                            </h4>
                            <p className="text-gray-600 mt-1 text-sm">{module.description}</p>
                            
                            <h5 className="text-sm font-medium text-gray-900 mt-3 mb-2">Resources:</h5>
                            <ul className="space-y-2">
                              {module.resources.map((resource, resourceIndex) => (
                                <li key={resourceIndex} className="text-sm">
                                  <div className="font-medium">{resource.title}</div>
                                  <div className="text-gray-500 text-xs">{resource.type}</div>
                                  <div className="text-gray-600">{resource.description}</div>
                                  {resource.url && (
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-900 text-xs"
                                    >
                                      View Resource
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                            
                            {module.assessment && module.assessment.questions.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-gray-900 mb-2">Assessment:</h5>
                                <div className="space-y-2">
                                  {module.assessment.questions.map((question, questionIndex) => (
                                    <div key={questionIndex} className="text-sm">
                                      <div className="font-medium">{question.question}</div>
                                      {question.options && (
                                        <ul className="ml-4 mt-1 space-y-1">
                                          {question.options.map((option, optionIndex) => (
                                            <li key={optionIndex} className="text-gray-600">
                                              {option}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}