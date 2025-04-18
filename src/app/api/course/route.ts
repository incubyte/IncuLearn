import { NextRequest } from 'next/server';
import { saveCourse, getUserCourses } from '@/services/course.service';
import { Course } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const courseData = await req.json() as Course;

    // Validate required fields
    const requiredFields = ['userId', 'title', 'description', 'currentLevel', 'targetSkill', 'learningPath'];
    const missingFields = requiredFields.filter(field => !courseData[field as keyof Course]);

    if (missingFields.length > 0) {
      return errorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Validate learningPath structure
    if (!courseData.learningPath?.modules || !Array.isArray(courseData.learningPath.modules)) {
      return errorResponse('Invalid learning path structure', 400);
    }

    // Save course
    const newCourse = await saveCourse(courseData);

    return successResponse({ course: newCourse }, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
    return errorResponse(errorMessage, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return errorResponse('Missing userId parameter', 400);
    }

    const courses = await getUserCourses(userId);

    return successResponse({ courses });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch courses';
    return errorResponse(errorMessage, 500);
  }
}