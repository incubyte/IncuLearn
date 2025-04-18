import { useState } from 'react';
import { Course, Module, ChatMessage } from '@/types';

interface UseCourseParams {
  initialCourse?: Partial<Course>;
}

export function useCourse({ initialCourse = {} }: UseCourseParams = {}) {
  // Use a temporary user ID (would normally come from authentication)
  const [userId] = useState<string>('temp-user-id-123');
  
  // Course state
  const [title, setTitle] = useState<string>(initialCourse.title || '');
  const [description, setDescription] = useState<string>(initialCourse.description || '');
  const [currentLevel, setCurrentLevel] = useState<string>(initialCourse.currentLevel || '');
  const [targetSkill, setTargetSkill] = useState<string>(initialCourse.targetSkill || '');
  const [modules, setModules] = useState<Module[]>(initialCourse.learningPath?.modules || []);
  const [estimatedTotalHours, setEstimatedTotalHours] = useState<string | undefined>(
    initialCourse.learningPath?.estimatedTotalHours
  );

  // Conversation state for AI interactions
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Build the course object from state
  const getCourseData = (): Course => ({
    userId,
    title: title || `${targetSkill} Learning Path`,
    description: description || `A personalized learning path for ${targetSkill}`,
    currentLevel: currentLevel || 'Not specified',
    targetSkill,
    learningPath: {
      modules,
      estimatedTotalHours
    },
    createdAt: initialCourse.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    feedback: initialCourse.feedback || [],
    _id: initialCourse._id
  });

  // Add a user message to the conversation
  const addUserMessage = (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content };
    setConversation([...conversation, userMessage]);
    return userMessage;
  };

  // Add an assistant message to the conversation
  const addAssistantMessage = (content: string) => {
    const assistantMessage: ChatMessage = { role: 'assistant', content };
    setConversation([...conversation, assistantMessage]);
    return assistantMessage;
  };

  // Update a module
  const updateModule = (index: number, updatedModule: Module) => {
    const newModules = [...modules];
    newModules[index] = updatedModule;
    setModules(newModules);
  };

  // Finalize a module (mark as complete)
  const finalizeModule = (index: number) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], isFinalized: true };
    setModules(newModules);
  };

  // Add a new module
  const addModule = (module: Module) => {
    setModules([...modules, module]);
  };

  // Reset any error
  const resetError = () => setError(null);

  return {
    // State
    userId,
    title,
    description,
    currentLevel,
    targetSkill,
    modules,
    estimatedTotalHours,
    conversation,
    followUpQuestion,
    isGenerating,
    error,
    
    // Setters
    setTitle,
    setDescription,
    setCurrentLevel,
    setTargetSkill,
    setModules,
    setEstimatedTotalHours,
    setFollowUpQuestion,
    setIsGenerating,
    setError,
    
    // Utility methods
    getCourseData,
    addUserMessage,
    addAssistantMessage,
    updateModule,
    finalizeModule,
    addModule,
    resetError
  };
}