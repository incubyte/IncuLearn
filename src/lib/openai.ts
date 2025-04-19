import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Resource {
  type: string;
  title: string;
  url?: string;
  description: string;
  estimatedMinutes?: string;
}

interface Module {
  title: string;
  description: string;
  estimatedHours?: string;
  resources: Resource[];
  assessment?: {
    questions: {
      question: string;
      options?: string[];
      correctAnswer?: string;
    }[];
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateLearningPath(messages: ChatMessage[]) {
  try {
    console.log('Sending request to OpenAI with messages:', messages);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 4000
    });

    console.log('Received response from OpenAI:', response);

    const content = response.choices[0].message.content;
    
    if (!content) {
      console.error('Empty response from OpenAI');
      throw new Error('Empty response from OpenAI');
    }

    try {
      // Ensure we're returning a parsed JSON object
      const parsedContent = JSON.parse(content);
      console.log('Parsed content:', parsedContent);
      
      // Validate the required fields are present
      if (!parsedContent.modules || !Array.isArray(parsedContent.modules)) {
        console.error('Invalid modules array in response:', parsedContent);
        throw new Error('Invalid or missing modules array in response');
      }

      // Ensure all required fields exist with default values if missing
      const processedContent = {
        ...parsedContent,
        estimatedTotalHours: parsedContent.estimatedTotalHours || '0',
        modules: parsedContent.modules.map((module: Module) => ({
          ...module,
          title: module.title || 'Untitled Module',
          description: module.description || 'No description provided',
          estimatedHours: module.estimatedHours || '1',
          resources: (module.resources || []).map((resource: Resource) => ({
            ...resource,
            type: resource.type || 'article',
            title: resource.title || 'Untitled Resource',
            description: resource.description || 'No description provided',
            estimatedMinutes: resource.estimatedMinutes || '30'
          }))
        })),
        followUpQuestion: parsedContent.followUpQuestion || 'Do you have any questions about the learning path?'
      };
      
      // Return the stringified JSON to maintain consistency with existing code
      return JSON.stringify(processedContent);
    } catch (error) {
      console.error('Invalid JSON response:', error);
      console.error('Content that failed to parse:', content);
      throw new Error(error instanceof Error ? error.message : 'Invalid JSON response from OpenAI');
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate learning path');
  }
}