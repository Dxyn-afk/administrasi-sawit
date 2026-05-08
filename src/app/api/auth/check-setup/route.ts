import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export async function GET() {
  const { data } = await supabaseAdmin.from('admin').select('id').limit(1);
  return NextResponse.json({ setup: (data?.length ?? 0) > 0 });
}
