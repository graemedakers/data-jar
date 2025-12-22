
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Even if user not found, we should return success to prevent email enumeration
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetToken: token,
                    passwordResetTokenExp: expiry,
                },
            });

            await sendPasswordResetEmail(email, token);
        }

        return NextResponse.json({ success: true, message: 'If an account exists with that email, we have sent a password reset link.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
