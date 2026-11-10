import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureDemoWorkspace, getDemoCredentials } from '@/lib/demo/seed';
import { serverError } from '@/lib/api/errors';

export async function POST() {
  try {
    const supabase = await createClient();
    const credentials = getDemoCredentials();

    const first = await supabase.auth.signInWithPassword(credentials);
    if (!first.error) {
      return NextResponse.json({ success: true });
    }

    await ensureDemoWorkspace();

    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      return serverError(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Demo sign-in failed:', error);
    return serverError();
  }
}
