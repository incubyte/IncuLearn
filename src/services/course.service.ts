import { connectToDatabase } from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import { Course, GenerateCourseRequest, ChatMessage, OpenAIResponse, Module as CourseModule } from '@/types';
import { generateLearningPath, extractJsonFromResponse } from './openai.service';

/**
 * Creates a system prompt for the learning path generation
 */
function createSystemPrompt(currentModules?: CourseModule[]): string {
  let basePrompt = `You are an expert educational AI assistant. Your task is to create a personalized learning path and ask relevant follow-up questions to improve it.

First, generate an initial learning path based on the user's target skill. Then, ask ONE specific question that will help you better personalize the content.`;

  if (currentModules) {
    basePrompt += `
Note: The user has modified the modules. Here are the current modules:
${JSON.stringify(currentModules, null, 2)}

IMPORTANT: When generating your response:
1. If the user asks to add a new module, add it as an additional module AFTER the existing ones
2. Do NOT replace any existing modules
3. Only add new content based on the user's latest request
4. If any element of the object of the currentModules array has isFinalized is true, do not modify that element. You can modify other elements in the array according to the prompt.
`;
  }

  basePrompt += `
Format your response as a JSON object with the following structure:
{
  "estimatedTotalHours": "Total estimated hours to complete the entire course",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "estimatedHours": "Estimated hours to complete this module",
      "resources": [
        {
          "type": "article/video/book/exercise",
          "title": "Resource title",
          "url": "optional url",
          "description": "Why this resource is helpful",
          "estimatedMinutes": "Estimated minutes to complete this resource"
        }
      ],
      "assessment": {
        "questions": [
          {
            "question": "Assessment question?",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": "correct option"
          }
        ]
      }
    }
  ],
  "followUpQuestion": "Your specific question to help personalize the content further"
}`;

  return basePrompt;
}

/**
 * Validates the OpenAI response structure for course generation
 */
function validateCourseResponse(response: OpenAIResponse): void {
  if (!response.modules || !Array.isArray(response.modules) || !response.followUpQuestion || !response.estimatedTotalHours) {
    throw new Error('Invalid response structure');
  }

  // Validate each module has required timing information
  for (const moduleItem of response.modules) {
    if (!moduleItem.estimatedHours) {
      throw new Error('Module missing estimated hours');
    }
    if (!Array.isArray(moduleItem.resources)) {
      throw new Error('Module missing resources array');
    }
    for (const resource of moduleItem.resources) {
      if (!resource.estimatedMinutes) {
        throw new Error('Resource missing estimated minutes');
      }
    }
  }
}

/**
 * Generates a course using OpenAI
 */
export async function generateCourse(request: GenerateCourseRequest): Promise<{ course: Course; followUpQuestion: string }> {
  const { userId, title, description, currentLevel, targetSkill, conversation, currentModules } = request;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: createSystemPrompt(currentModules)
    },
    ...conversation,
  ];

  // Generate learning path from OpenAI
  const learningPathResponse = await generateLearningPath(messages);
  
  // Parse and validate the response
  const response = extractJsonFromResponse(learningPathResponse);
  validateCourseResponse(response);

  // Create and return the course
  const course: Course = {
    userId,
    title: title || `${targetSkill} Learning Path`,
    description: description || `A personalized learning path for ${targetSkill}`,
    currentLevel: currentLevel || 'Not specified',
    targetSkill,
    learningPath: { 
      modules: response.modules,
      estimatedTotalHours: response.estimatedTotalHours 
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    course,
    followUpQuestion: response.followUpQuestion
  };
}

/**
 * Saves a course to the database
 */
export async function saveCourse(course: Course): Promise<Course> {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database');

    console.log('Creating new course model...');
    const newCourse = new CourseModel(course);
    
    console.log('Validating course data...');
    await newCourse.validate();
    
    console.log('Saving course to database...');
    const savedCourse = await newCourse.save();
    console.log('Course saved successfully');
    
    return savedCourse.toObject();
  } catch (error) {
    console.error('Error saving course:', error);
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        throw new Error(`Course validation failed: ${error.message}`);
      }
      if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        throw new Error('A course with this ID already exists');
      }
    }
    throw new Error('Failed to save course to database');
  }
}

/**
 * Gets all courses for a user
 */
export async function getUserCourses(userId: string): Promise<Course[]> {
  await connectToDatabase();
  const courses = await CourseModel.find({ userId }).sort({ updatedAt: -1 });
  return courses;
}

/**
 * Gets a course by ID
 */
export async function getCourseById(id: string): Promise<Course | null> {
  await connectToDatabase();
  const course = await CourseModel.findById(id);
  return course ? course.toObject() : null;
}

/**
 * Adds feedback to a course
 */
export async function addFeedback(courseId: string, moduleIndex: number, comment: string, rating: number): Promise<Course | null> {
  await connectToDatabase();
  
  const course = await CourseModel.findByIdAndUpdate(
    courseId,
    {
      $push: {
        feedback: {
          moduleIndex,
          comment,
          rating,
          createdAt: new Date()
        }
      }
    },
    { new: true }
  );
  
  return course ? course.toObject() : null;
}