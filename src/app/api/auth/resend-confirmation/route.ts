import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@/lib/env';

// Create admin client with service role key for operations that need to bypass RLS
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use the admin client to resend the confirmation email
    const { error } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      console.error('Error resending confirmation email:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to resend confirmation email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Confirmation email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in resend-confirmation API route:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
} 