import { NextRequest } from 'next/server';
import { getCourseById, addFeedback } from '@/services/course.service';
import { connectToDatabase } from '@/lib/mongodb';
import Course from '@/models/Course';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    if (!courseId) {
      return errorResponse('Missing course ID', 400);
    }

    const course = await getCourseById(courseId);

    if (!course) {
      return errorResponse('Course not found', 404);
    }

    return successResponse({ course });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch course';
    return errorResponse(errorMessage, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const { moduleIndex, comment, rating } = await req.json();
    
    if (moduleIndex === undefined || !comment || !rating) {
      return errorResponse('Module index, comment, and rating are required', 400);
    }

    const updatedCourse = await addFeedback(courseId, moduleIndex, comment, rating);
    
    if (!updatedCourse) {
      return errorResponse('Course not found', 404);
    }

    return successResponse({ course: updatedCourse });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update course';
    return errorResponse(errorMessage, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const course = await Course.findByIdAndDelete(params.id);

    if (!course) {
      return errorResponse('Course not found', 404);
    }

    return successResponse({ message: 'Course deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete course';
    return errorResponse(errorMessage, 500);
  }
}