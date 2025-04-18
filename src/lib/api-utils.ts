import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

/**
 * Creates a consistent API response format
 */
export function createApiResponse<T>(data?: T, error?: string, status: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    status,
  };

  if (data) {
    response.data = data;
  }

  if (error) {
    response.error = error;
  }

  return NextResponse.json(response, { status });
}

/**
 * Creates a success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return createApiResponse(data, undefined, status);
}

/**
 * Creates an error response
 */
export function errorResponse(error: string, status: number = 500): NextResponse {
  return createApiResponse(undefined, error, status);
}

/**
 * Handles errors in API routes
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return errorResponse(error.message);
  }
  
  return errorResponse('An unknown error occurred');
}