import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';
import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { name, email, password, inviteCode, location } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        let coupleId;
        let referenceCode;

        if (inviteCode) {
            // JOINING EXISTING COUPLE
            const couple = await prisma.couple.findUnique({
                where: { referenceCode: inviteCode },
            });

            if (!couple) {
                return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
            }
            coupleId = couple.id;
            referenceCode = couple.referenceCode;
        } else {
            // CREATING NEW COUPLE
            referenceCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const newCouple = await prisma.couple.create({
                data: {
                    referenceCode,
                    location,
                },
            });
            coupleId = newCouple.id;


        }

        // Create User
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                coupleId,
            },
        });

        // Login the user immediately
        await login(user);

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
