import { NextRequest } from 'next/server';
import { generateCourse } from '@/services/course.service';
import { GenerateCourseRequest } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json() as GenerateCourseRequest;
    
    // Validate required fields
    if (!requestData.userId || !requestData.targetSkill || !requestData.conversation) {
      return errorResponse('Missing required fields', 400);
    }

    // Generate course using the service
    const result = await generateCourse(requestData);
    
    // Return the generated course and follow-up question
    return successResponse(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate course';
    return errorResponse(errorMessage, 500);
  }
}