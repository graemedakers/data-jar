
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    return NextResponse.json({
        hasSession: !!session,
        userEmail: session?.user?.email || null,
        userId: session?.user?.id || null,
        expires: session?.expires || null
    });
}
