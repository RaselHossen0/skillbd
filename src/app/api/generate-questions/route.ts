import { NextResponse } from 'next/server';
import Replicate from 'replicate';

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN is not set in environment variables');
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { skill } = await request.json();

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill parameter is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate 3 multiple choice questions about ${skill}. Format the response as a JSON array with objects containing 'question', 'options' (array of 4 strings), and 'correctAnswer' (string). Make the questions challenging and practical.`;
    
    console.log('Sending request to Replicate with prompt:', prompt);
    
    const output = await replicate.run(
      "anthropic/claude-3.5-haiku",
      {
        input: {
          prompt: prompt,
          max_tokens: 1000,
        }
      }
    );

    console.log('Received response from Replicate:', output);

    if (!output) {
      throw new Error('No response from Replicate');
    }

    // Join the chunks and parse the JSON
    const jsonString = Array.isArray(output) ? output.join('') : output;
    let questions;
    
    try {
      questions = JSON.parse(jsonString);
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
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      };
    });

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