import { NextResponse } from 'next/server';
import Replicate from 'replicate';

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN is not set in environment variables');
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

function cleanAndParseJSON(jsonString: string) {
  try {
    // First try parsing as is
    return JSON.parse(jsonString);
  } catch (e) {
    // If that fails, try to clean up the string
    try {
      // Remove any non-JSON text before the first [ and after the last ]
      const cleaned = jsonString.replace(/^[^[]*/, '').replace(/[^\]]*$/, '');
      return JSON.parse(cleaned);
    } catch (e2) {
      // If that still fails, try to extract just the array content
      const match = jsonString.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('Could not parse JSON from response');
    }
  }
}

export async function POST(request: Request) {
  try {
    const { skill, questionCount } = await request.json();

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill parameter is required' },
        { status: 400 }
      );
    }

    if (!questionCount || typeof questionCount !== 'number' || questionCount < 1) {
      return NextResponse.json(
        { error: 'Valid question count is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate ${questionCount} multiple choice questions about ${skill}. Format the response as a JSON array with objects containing 'question', 'options' (array of 4 strings), and 'correctAnswer' (string). Make the questions challenging and practical. Each question should test different aspects of ${skill}. Return ONLY the JSON array, no other text.`;
    
    console.log('Sending request to Replicate with prompt:', prompt);
    
    const output = await replicate.run(
      "anthropic/claude-3.5-haiku",
      {
        input: {
          prompt: prompt,
          max_tokens: 2000,
        }
      }
    );

    console.log('Received response from Replicate:', output);

    if (!output) {
      throw new Error('No response from Replicate');
    }

    // Handle different response formats
    let jsonString: string;
    if (Array.isArray(output)) {
      // Join array chunks
      jsonString = output.join('');
    } else if (typeof output === 'string') {
      jsonString = output;
    } else {
      throw new Error('Unexpected response format from Replicate');
    }

    let questions;
    try {
      questions = cleanAndParseJSON(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON:', jsonString);
      throw new Error('Invalid JSON response from Replicate');
    }

    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array of questions');
    }

    // Validate each question has the required fields
    const validatedQuestions = questions.map((q, index) => {
      if (!q.question || !Array.isArray(q.options) || !q.correctAnswer) {
        throw new Error(`Invalid question format at index ${index}`);
      }
      if (q.options.length !== 4) {
        throw new Error(`Question at index ${index} must have exactly 4 options`);
      }
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      };
    });

    // Ensure we have the requested number of questions
    if (validatedQuestions.length !== questionCount) {
      console.warn(`Requested ${questionCount} questions but received ${validatedQuestions.length}`);
    }

    return NextResponse.json({ questions: validatedQuestions });
  } catch (error) {
    console.error('Detailed error in generate-questions:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 