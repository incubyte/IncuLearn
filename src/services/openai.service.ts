import OpenAI from 'openai';
import { ChatMessage, OpenAIResponse } from '@/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a learning path using OpenAI API
 */
export async function generateLearningPath(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    validateJsonResponse(content);
    
    return content;
  } catch (error) {
    throw new Error(`Failed to generate learning path: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates that the OpenAI response is properly formatted JSON with required fields
 */
function validateJsonResponse(content: string): void {
  try {
    const parsedContent = JSON.parse(content) as OpenAIResponse;
    
    // Validate the required fields are present
    if (!parsedContent.estimatedTotalHours) {
      throw new Error('Missing estimatedTotalHours in response');
    }
    
    if (!Array.isArray(parsedContent.modules)) {
      throw new Error('Invalid modules array in response');
    }

    // Additional validation could be added here
  } catch (error) {
    throw new Error(`Invalid JSON response from OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts JSON from a potential markdown code block or text response
 */
export function extractJsonFromResponse(response: string): OpenAIResponse {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse response JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}