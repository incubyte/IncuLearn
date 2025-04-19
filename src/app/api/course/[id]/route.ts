import { NextRequest } from 'next/server';
import { getUserCourses, getCourseById, addFeedback } from '@/services/course.service';
import { connectToDatabase } from '@/lib/mongodb';
import Course from '@/models/Course';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return errorResponse('Missing ID parameter', 400);
    }

    // Check if this is a course ID or user ID based on some condition
    // For MongoDB ObjectId, they're typically 24 hex characters
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isObjectId) {
      // If it's an ObjectId, try to fetch a specific course
      console.log('Fetching course with ID:', id);
      const course = await getCourseById(id);
      
      if (!course) {
        return errorResponse('Course not found', 404);
      }
      
      console.log('Found course:', course.title);
      return successResponse({ course });
    } else {
      // If it's not an ObjectId, assume it's a userId and get all courses for that user
      console.log('Fetching courses for user:', id);
      const courses = await getUserCourses(id);
      
      if (!courses || courses.length === 0) {
        return errorResponse('No courses found for this user', 404);
      }
      
      console.log(`Found ${courses.length} courses for user:`, id);
      return successResponse({ courses });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch course data';
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