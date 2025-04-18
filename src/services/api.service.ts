import { Course, ChatMessage, Module, GenerateCourseResponse } from '@/types';

const API_BASE_URL = '/api';

/**
 * Handles API errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data.data || data;
}

/**
 * Generates a course using the API
 */
export async function generateCourse(
  userId: string,
  targetSkill: string,
  conversation: ChatMessage[],
  options?: {
    title?: string;
    description?: string;
    currentLevel?: string;
    currentModules?: Module[];
  }
): Promise<GenerateCourseResponse> {
  const response = await fetch(`${API_BASE_URL}/course/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      targetSkill,
      conversation,
      title: options?.title,
      description: options?.description,
      currentLevel: options?.currentLevel,
      currentModules: options?.currentModules,
    }),
  });

  return handleResponse<GenerateCourseResponse>(response);
}

/**
 * Saves a course to the database
 */
export async function saveCourse(course: Course): Promise<{ course: Course }> {
  const response = await fetch(`${API_BASE_URL}/course`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(course),
  });

  return handleResponse<{ course: Course }>(response);
}

/**
 * Gets courses for a user
 */
export async function getUserCourses(userId: string): Promise<{ courses: Course[] }> {
  const response = await fetch(`${API_BASE_URL}/course?userId=${userId}`);
  return handleResponse<{ courses: Course[] }>(response);
}

/**
 * Gets a course by ID
 */
export async function getCourseById(courseId: string): Promise<{ course: Course }> {
  const response = await fetch(`${API_BASE_URL}/course/${courseId}`);
  return handleResponse<{ course: Course }>(response);
}

/**
 * Add feedback to a course
 */
export async function addFeedback(
  courseId: string,
  moduleIndex: number,
  comment: string,
  rating: number
): Promise<{ course: Course }> {
  const response = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      moduleIndex,
      comment,
      rating,
    }),
  });

  return handleResponse<{ course: Course }>(response);
}

/**
 * Deletes a course
 */
export async function deleteCourse(courseId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/course/${courseId}`, {
    method: 'DELETE',
  });

  return handleResponse<{ message: string }>(response);
}