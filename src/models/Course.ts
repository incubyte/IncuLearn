import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  userId: string;
  title: string;
  description: string;
  currentLevel: string;
  targetSkill: string;
  learningPath: {
    modules: Array<{
      title: string;
      description: string;
      resources: Array<{
        type: string;
        title: string;
        url?: string;
        description: string;
      }>;
      assessment?: {
        questions: Array<{
          question: string;
          options?: string[];
          correctAnswer?: string;
        }>;
      };
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
  feedback?: Array<{
    moduleIndex: number;
    comment: string;
    rating: number;
    createdAt: Date;
  }>;
}

const CourseSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    currentLevel: { type: String, required: true },
    targetSkill: { type: String, required: true },
    learningPath: {
      modules: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          resources: [
            {
              type: { type: String, required: true },
              title: { type: String, required: true },
              url: { type: String },
              description: { type: String, required: true },
            },
          ],
          assessment: {
            questions: [
              {
                question: { type: String, required: true },
                options: [{ type: String }],
                correctAnswer: { type: String },
              },
            ],
          },
        },
      ],
    },
    feedback: [
      {
        moduleIndex: { type: Number, required: true },
        comment: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);