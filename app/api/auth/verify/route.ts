
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        // Verify user
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null, // Clear token so it can't be reused
            },
        });

        // Log them in
        await login(updatedUser);

        // Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
