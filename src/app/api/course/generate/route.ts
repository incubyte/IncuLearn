import { NextRequest, NextResponse } from 'next/server';
import { generateLearningPath } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId, title, description, currentLevel, targetSkill, conversation, currentModules } = await req.json();
    console.log(" ============== userId:",userId);
    console.log(" ============== title:",title);
    console.log(" ============== description:",description);
    console.log(" ============== currentLevel:",currentLevel);
    console.log(" ============== targetSkill:",targetSkill);
    console.log(" ============== conversation:",conversation);
    console.log(" ============== currentModules:",currentModules);
    
    // Validate required fields
    if (!userId || !targetSkill || !conversation) {
      console.error('Missing required fields:', { userId, targetSkill, hasConversation: !!conversation });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format conversation for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are an expert educational AI assistant. Your task is to create a detailed learning path and ask relevant follow-up questions to improve it.

First, generate an initial learning path based on the user's target skill. Then, ask ONE specific question that will help you better personalize the content.
The resources section can be text/code/video/links/exercise/etc.
${currentModules ? `
Note: The user has modified the modules. Here are the current modules:
${JSON.stringify(currentModules, null, 2)}

IMPORTANT: When generating your response:
1. If the user asks to add a new module, add it as an additional module AFTER the existing ones
2. Do NOT replace any existing modules
3. Only add new content based on the user's latest request
4. If any element of the object of the currentModules array has isFinalized is true, do not modify that element. You can modify other elements in the array according to the prompt.
` : ''}

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
}`
      },
      ...conversation,
    ];

    // Generate learning path from OpenAI
    const learningPathResponse = await generateLearningPath(messages);
    console.log(" ============== learningPathResponse:", learningPathResponse);
    
    // Parse the response
    let response;
    try {
      // The AI might return markdown code blocks or additional text, so we need to extract just the JSON
      const jsonMatch = learningPathResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', learningPathResponse);
        throw new Error('No JSON found in response');
      }
      const jsonString = jsonMatch[0];
      response = JSON.parse(jsonString);
      console.log(" ============== parsed response:", response);

      // Validate the response structure
      if (!response.modules || !Array.isArray(response.modules)) {
        console.error('Invalid modules array:', response);
        throw new Error('Invalid or missing modules array');
      }

      // Return the generated course and follow-up question
      return NextResponse.json({
        course: {
          userId,
          title: title || `${targetSkill} Learning Path`,
          description: description || `A personalized learning path for ${targetSkill}`,
          currentLevel: currentLevel || 'Not specified',
          targetSkill,
          learningPath: { 
            modules: response.modules,
            estimatedTotalHours: response.estimatedTotalHours || '0'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        followUpQuestion: response.followUpQuestion || 'Do you have any questions about the learning path?'
      }, { status: 200 });
    } catch (error) {
      console.error('Failed to parse response JSON:', error);
      console.error('Raw response:', learningPathResponse);
      return NextResponse.json(
        { error: `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating course:', error);
    return NextResponse.json(
      { error: `Failed to generate course: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 