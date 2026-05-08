import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  try {
    const body = await req.json();
    if (!body.version || !Array.isArray(body.transaksi))
      return NextResponse.json({ error: 'Format backup tidak valid' }, { status: 400 });

    // Get existing IDs
    const { data: existing } = await supabaseAdmin.from('transaksi').select('id');
    const existingIds = new Set((existing || []).map((r: any) => r.id));

    const newTx = body.transaksi.filter((t: any) => !existingIds.has(t.id));
    let added = 0, failed = 0;

    if (newTx.length > 0) {
      const chunks = [];
      for (let i = 0; i < newTx.length; i += 100) chunks.push(newTx.slice(i, i + 100));
      for (const chunk of chunks) {
        const { error } = await supabaseAdmin.from('transaksi').insert(chunk);
        if (error) failed += chunk.length;
        else added += chunk.length;
      }
    }

    return NextResponse.json({ ok: true, added, skipped: body.transaksi.length - newTx.length, failed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
