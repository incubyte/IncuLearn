import mongoose, { Schema } from 'mongoose';
import { Course, Module, Resource, AssessmentQuestion, Feedback } from '@/types';

// Create schemas for nested types
const ResourceSchema = new Schema<Resource>({
  type: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String },
  description: { type: String, required: true },
  estimatedMinutes: { type: String },
});

const AssessmentQuestionSchema = new Schema<AssessmentQuestion>({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
});

const ModuleSchema = new Schema<Module>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  estimatedHours: { type: String },
  resources: [ResourceSchema],
  assessment: {
    questions: [AssessmentQuestionSchema],
  },
  isFinalized: { type: Boolean, default: false }
});

const FeedbackSchema = new Schema<Feedback>({
  moduleIndex: { type: Number, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

// Main Course schema
const CourseSchema = new Schema<Course>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    currentLevel: { type: String, required: true },
    targetSkill: { type: String, required: true },
    learningPath: {
      modules: [ModuleSchema],
      estimatedTotalHours: { type: String },
    },
    feedback: [FeedbackSchema],
  },
  {
    timestamps: true,
  }
);

// Export the model, handling potential model redefinition
export default mongoose.models.Course || mongoose.model<Course>('Course', CourseSchema);