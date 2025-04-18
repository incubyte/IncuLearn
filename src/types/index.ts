export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Resource {
  type: string;
  title: string;
  url?: string;
  description: string;
  estimatedMinutes?: string;
}

export interface AssessmentQuestion {
  question: string;
  options?: string[];
  correctAnswer?: string;
}

export interface Module {
  title: string;
  description: string;
  estimatedHours?: string;
  resources: Resource[];
  assessment?: {
    questions: AssessmentQuestion[];
  };
  isFinalized?: boolean;
}

export interface LearningPath {
  modules: Module[];
  estimatedTotalHours?: string;
}

export interface Course {
  userId: string;
  title: string;
  description: string;
  currentLevel: string;
  targetSkill: string;
  learningPath: LearningPath;
  createdAt: Date | string;
  updatedAt: Date | string;
  feedback?: Feedback[];
  _id?: string;
}

export interface Feedback {
  moduleIndex: number;
  comment: string;
  rating: number;
  createdAt: Date;
}

export interface GenerateCourseRequest {
  userId: string;
  title?: string;
  description?: string;
  currentLevel?: string;
  targetSkill: string;
  conversation: ChatMessage[];
  currentModules?: Module[];
}

export interface GenerateCourseResponse {
  course: Course;
  followUpQuestion: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface OpenAIResponse {
  modules: Module[];
  estimatedTotalHours: string;
  followUpQuestion: string;
}