import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get('employerId');
  if (!employerId) {
    return NextResponse.json({ error: 'Missing employerId' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ questions: data });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  // Debug: log cookies
  console.log('API POST /api/assessments cookies:', cookieStore.getAll());
  const { data: { user }, error } = await supabase.auth.getUser();
  // Debug: log user and error
  console.log('API POST /api/assessments user:', user, 'error:', error);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json();
  const { job_id, question, options, correct_option } = body;
  if (!question || !options || correct_option === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { data, error: insertError } = await supabase
    .from('assessment_questions')
    .insert([
      {
        id: uuidv4(),
        employer_id: user.id, // Use authenticated user's UUID
        job_id: job_id || null,
        question,
        options,
        correct_option,
      },
    ])
    .select('*')
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
  return NextResponse.json({ question: data });
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const { error } = await supabase
    .from('assessment_questions')
    .delete()
    .eq('id', id)
    .eq('employer_id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 