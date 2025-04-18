import { NextRequest, NextResponse } from 'next/server';
import { generateLearningPath } from '@/lib/openai';
import { connectToDatabase } from '@/lib/mongodb';
import Course from '@/models/Course';

export async function POST(req: NextRequest) {
  try {
    const { userId, title, description, currentLevel, targetSkill, conversation } = await req.json();

    // Validate required fields
    if (!userId || !title || !description || !currentLevel || !targetSkill || !conversation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format conversation for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an expert educational AI assistant. Create a personalized learning path for a student based 
        on their current level (${currentLevel}) and their target skill (${targetSkill}). 
        The learning path should include modules with clear titles, descriptions, and curated resources.
        Each module should also include assessment questions.
        Format your response as a JSON object with the following structure:
        {
          "modules": [
            {
              "title": "Module title",
              "description": "Module description",
              "resources": [
                {
                  "type": "article/video/book/exercise", 
                  "title": "Resource title", 
                  "url": "optional url", 
                  "description": "Why this resource is helpful"
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
          ]
        }`,
      },
      ...conversation,
    ];

    // Generate learning path from OpenAI
    const learningPathResponse = await generateLearningPath(messages);
    
    // Parse the response
    let learningPath;
    try {
      // The AI might return markdown code blocks or additional text, so we need to extract just the JSON
      const jsonMatch = learningPathResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : learningPathResponse;
      learningPath = JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse learning path JSON:', error);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Create new course
    const newCourse = new Course({
      userId,
      title,
      description,
      currentLevel,
      targetSkill,
      learningPath,
    });

    await newCourse.save();

    return NextResponse.json(
      { success: true, course: newCourse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const courses = await Course.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}