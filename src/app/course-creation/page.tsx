'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Resource {
  type: string;
  title: string;
  url?: string;
  description: string;
  estimatedMinutes: string;
}

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: string;
}

interface Module {
  title: string;
  description: string;
  estimatedHours: string;
  resources: Resource[];
  assessment?: {
    questions: Question[];
  };
  isFinalized?: boolean;
}

interface LearningPath {
  modules: Module[];
  estimatedTotalHours: string;
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

interface EditingModule extends Module {
  index: number;
}

export default function CourseCreation() {
  const tempUserId = 'user123';
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Welcome! I'm here to help create your personalized learning path. What skill would you like to learn or improve?"
  }]);
  const [input, setInput] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [editingModule, setEditingModule] = useState<EditingModule | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleModuleDelete = (index: number) => {
    if (!course) return;

    const updatedModules = course.learningPath.modules.filter((_, i) => i !== index);
    setCourse({
      ...course,
      learningPath: { 
        modules: updatedModules,
        estimatedTotalHours: course.learningPath.estimatedTotalHours
      }
    });

    // Add a system message about the deletion
    setMessages(prev => [...prev, {
      role: 'system',
      content: `Module ${index + 1} has been deleted.`
    }]);
  };

  const handleModuleEdit = (module: Module, index: number) => {
    setEditingModule({ ...module, index });
    setExpandedModule(index);
  };

  const handleModuleSave = () => {
    if (!course || !editingModule) return;

    const updatedModules = [...course.learningPath.modules];
    const { index, isFinalized, ...moduleWithoutMeta } = editingModule;
    updatedModules[editingModule.index] = {
      ...moduleWithoutMeta,
      isFinalized: editingModule.isFinalized
    };

    setCourse({
      ...course,
      learningPath: { 
        modules: updatedModules,
        estimatedTotalHours: course.learningPath.estimatedTotalHours
      }
    });

    // Add a system message about the edit
    setMessages(prev => [...prev, {
      role: 'system',
      content: `Module ${editingModule.index + 1} has been updated.`
    }]);

    setEditingModule(null);
  };

  const handleModuleFinalize = (index: number) => {
    if (!course) return;

    const updatedModules = [...course.learningPath.modules];
    updatedModules[index] = {
      ...updatedModules[index],
      isFinalized: !updatedModules[index].isFinalized
    };

    setCourse({
      ...course,
      learningPath: { 
        modules: updatedModules,
        estimatedTotalHours: course.learningPath.estimatedTotalHours
      }
    });

    // Add a system message about the finalization
    setMessages(prev => [...prev, {
      role: 'system',
      content: `Module ${index + 1} has been ${updatedModules[index].isFinalized ? 'finalized' : 'un-finalized'}.`
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const userMessages = allMessages.filter(m => m.role === 'user');
      
      // Get the target skill from the first user message
      const targetSkill = userMessages[0].content;

      // Filter out finalized modules from being updated
      const currentModules = course?.learningPath.modules;

      // Call the API to generate/update the course
      const response = await axios.post('/api/course/generate', {
        userId: tempUserId,
        targetSkill,
        conversation: allMessages,
        currentModules
      });

      // Ensure we have a valid response with course data
      if (!response.data?.course) {
        throw new Error('Invalid response: Missing course data');
      }

      // Ensure learningPath exists with default values if missing
      const learningPath = response.data.course.learningPath || { modules: [], estimatedTotalHours: '0' };

      // Merge the new modules with finalized ones
      if (course) {
        const newModules = learningPath.modules;
        // First, create a copy of the current modules to preserve them all
        const mergedModules = [...course.learningPath.modules];
        
        // Replace non-finalized modules with new ones at the same positions
        for (let i = 0; i < mergedModules.length; i++) {
          if (!mergedModules[i].isFinalized && i < newModules.length) {
            mergedModules[i] = { ...newModules[i], isFinalized: false };
          }
        }

        // Add any additional new modules at the end
        for (let i = mergedModules.length; i < newModules.length; i++) {
          mergedModules.push({ ...newModules[i], isFinalized: false });
        }

        setCourse({
          ...response.data.course,
          learningPath: { 
            modules: mergedModules,
            estimatedTotalHours: learningPath.estimatedTotalHours
          }
        });
      } else {
        // For initial course creation, mark all modules as non-finalized
        const modulesWithFinalized = learningPath.modules.map(
          (module: Module) => ({ ...module, isFinalized: false })
        );
        setCourse({
          ...response.data.course,
          learningPath: { 
            modules: modulesWithFinalized,
            estimatedTotalHours: learningPath.estimatedTotalHours
          }
        });
      }
      
      // Add the follow-up question to the chat
      if (response.data.followUpQuestion) {
        const followUpMessage: Message = {
          role: 'assistant',
          content: response.data.followUpQuestion
        };
        setMessages((prev) => [...prev, followUpMessage]);
      } else {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: 'I\'ve updated your learning path. Do you have any questions about the modules?'
        }]);
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

  const handleCreateCourse = async () => {
    if (!course) return;
    
    try {
      setLoading(true);
      // Remove isFinalized property from all modules before saving
      const cleanModules = course.learningPath.modules.map(({ isFinalized, ...module }: Module & { isFinalized?: boolean }) => module);
      
      await axios.post('/api/course', {
        userId: tempUserId,
        title: course.title,
        description: course.description,
        currentLevel: course.currentLevel,
        targetSkill: course.targetSkill,
        learningPath: { 
          modules: cleanModules,
          estimatedTotalHours: course.learningPath.estimatedTotalHours
        }
      });
      
      // Redirect to my courses page after successful creation
      window.location.href = '/my-courses';
    } catch (error) {
      console.error('Error creating course:', error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        alert('This course has already been created. Redirecting to My Courses...');
        window.location.href = '/my-courses';
      } else {
        alert('Failed to create course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const slideIn = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  const renderEditingModule = () => {
    if (!editingModule) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit Module {editingModule.index + 1}</h3>
            <button
              onClick={() => setEditingModule(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={editingModule.title}
                onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editingModule.description}
                onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Resources</label>
              {editingModule.resources.map((resource, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                  <input
                    type="text"
                    value={resource.title}
                    onChange={(e) => {
                      const updatedResources = [...editingModule.resources];
                      updatedResources[index] = { ...resource, title: e.target.value };
                      setEditingModule({ ...editingModule, resources: updatedResources });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                    placeholder="Resource title"
                  />
                  <input
                    type="text"
                    value={resource.url || ''}
                    onChange={(e) => {
                      const updatedResources = [...editingModule.resources];
                      updatedResources[index] = { ...resource, url: e.target.value };
                      setEditingModule({ ...editingModule, resources: updatedResources });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                    placeholder="Resource URL (optional)"
                  />
                  <textarea
                    value={resource.description}
                    onChange={(e) => {
                      const updatedResources = [...editingModule.resources];
                      updatedResources[index] = { ...resource, description: e.target.value };
                      setEditingModule({ ...editingModule, resources: updatedResources });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Resource description"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {editingModule.assessment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Assessment Questions</label>
                {editingModule.assessment.questions.map((question, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => {
                        const updatedQuestions = [...editingModule.assessment!.questions];
                        updatedQuestions[index] = { ...question, question: e.target.value };
                        setEditingModule({
                          ...editingModule,
                          assessment: { ...editingModule.assessment!, questions: updatedQuestions }
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                      placeholder="Question"
                    />
                    {question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <input
                            key={optionIndex}
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const updatedQuestions = [...editingModule.assessment!.questions];
                              const updatedOptions = [...question.options!];
                              updatedOptions[optionIndex] = e.target.value;
                              updatedQuestions[index] = { ...question, options: updatedOptions };
                              setEditingModule({
                                ...editingModule,
                                assessment: { ...editingModule.assessment!, questions: updatedQuestions }
                              });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleModuleSave}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
    >
      <div className="h-screen max-w-full">
        <div className="flex h-full">
          {/* Left Panel - Chat Interface */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-1/2 h-full border-r border-gray-200 bg-white/80 backdrop-blur-sm flex flex-col shadow-lg"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Course Assistant
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={fadeIn.initial}
                    animate={fadeIn.animate}
                    exit={fadeIn.exit}
                    transition={{ duration: 0.3 }}
                    className={`mb-4 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-4 rounded-2xl max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-100'
                          : 'bg-white text-gray-900 shadow-lg'
                      } shadow-lg`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-full shadow-sm py-3 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:transform-none"
                >
                  {loading ? 'Thinking...' : 'Send'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Right Panel - Course Preview */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-1/2 h-full bg-white/80 backdrop-blur-sm overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Learning Path
              </h2>
            </div>
            
            <div className="p-6">
              <AnimatePresence mode="wait">
                {course ? (
                  <motion.div
                    key="course"
                    initial={slideIn.initial}
                    animate={slideIn.animate}
                    exit={slideIn.exit}
                  >
                    <div className="mb-8">
                      <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-medium text-gray-900"
                      >
                        {course.title}
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 text-gray-600"
                      >
                        {course.description}
                      </motion.p>
                    </div>
                    
                    <div className="space-y-4">
                      {course.learningPath.modules.map((module, index) => (
                        <motion.div
                          key={index}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                            module.isFinalized ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center p-6">
                            <button
                              onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                              className="flex-1 flex items-center text-left"
                            >
                              <div className="flex items-center gap-2">
                                {module.isFinalized && (
                                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                )}
                                <h4 className="text-lg font-medium text-gray-900">
                                  Module {index + 1}: {module.title}
                                </h4>
                              </div>
                              <ChevronDownIcon 
                                className={`ml-2 w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                                  expandedModule === index ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleModuleFinalize(index)}
                                className={`p-2 transition-colors ${
                                  module.isFinalized 
                                    ? 'text-green-600 hover:text-green-700 bg-green-50 rounded-lg' 
                                    : 'text-gray-400 hover:text-green-600'
                                }`}
                                title={module.isFinalized ? 'Un-finalize module' : 'Finalize module'}
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleModuleEdit(module, index)}
                                className="p-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                                disabled={module.isFinalized}
                                title={module.isFinalized ? 'Cannot edit finalized module' : 'Edit module'}
                              >
                                <PencilIcon className={`w-4 h-4 ${module.isFinalized ? 'opacity-50' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleModuleDelete(index)}
                                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                disabled={module.isFinalized}
                                title={module.isFinalized ? 'Cannot delete finalized module' : 'Delete module'}
                              >
                                <TrashIcon className={`w-4 h-4 ${module.isFinalized ? 'opacity-50' : ''}`} />
                              </button>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {expandedModule === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-gray-100"
                              >
                                <div className="p-6">
                                  <p className="text-gray-600 mb-6">{module.description}</p>
                                  
                                  {module.resources.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-900 mb-4">Resources:</h5>
                                      <ul className="space-y-4">
                                        {module.resources.map((resource, rIndex) => (
                                          <motion.li
                                            key={rIndex}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: rIndex * 0.1 }}
                                            className="text-sm bg-gray-50 rounded-lg p-4"
                                          >
                                            {resource.url ? (
                                              <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-500 font-medium"
                                              >
                                                {resource.title}
                                              </a>
                                            ) : (
                                              <span className="font-medium">{resource.title}</span>
                                            )}
                                            <p className="mt-2 text-gray-600">{resource.description}</p>
                                          </motion.li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8 flex justify-center"
                    >
                      <button
                        onClick={handleCreateCourse}
                        disabled={loading}
                        className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:transform-none flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Course...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Course
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={fadeIn.initial}
                    animate={fadeIn.animate}
                    exit={fadeIn.exit}
                    className="text-center py-12"
                  >
                    <p className="text-gray-500">
                      Chat with the AI assistant to generate your personalized learning path.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Module editing modal */}
      <AnimatePresence>
        {editingModule && renderEditingModule()}
      </AnimatePresence>
    </motion.div>
  );
}