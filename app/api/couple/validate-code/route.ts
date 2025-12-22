import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 });
        }

        const jar = await prisma.jar.findUnique({
            where: { referenceCode: code },
            include: { members: true }
        });

        if (!jar) {
            return NextResponse.json({ valid: false, error: 'Invalid invite code' });
        }

        // Limit Check: Free plans limited to 4 members
        // Pro plans unlimited
        // We need to check if ANY user in the jar is Pro? Or if the Jar itself is "Premium"?
        // Since subscription is now USER based, this gets tricky.
        // Simplified rule: Allow joining. Access restrictions happen later.

        // However, we might want to cap it to prevent spam.
        // Let's keep a soft limit of 50 for now, or just remove the check if "Squad Mode" allows unlimited.
        // Ideally: check if Jar Owner is Pro?
        // Let's just check against reasonable max or basic free limit (4) if we want to enforce it early.
        // But for now, let's just allow it and let "feature gating" logic handle restrictions.
        // Actually, let's block > 4 if no one is Pro? Too complex for this endpoint.
        // Safest: Just remove the limit check here or set it high (50).
        if (jar.members.length >= 50) {
            return NextResponse.json({ valid: false, error: 'This jar is full' });
        }

        return NextResponse.json({ valid: true });

    } catch (error: any) {
        console.error('Error validating code:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
