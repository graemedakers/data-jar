import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

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

        if (!inviteCode) {
            // Create new couple
            const couple = await prisma.couple.create({
                data: {
                    referenceCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    location: location || 'Unknown',
                    isPremium: false, // Explicitly set to false, though default is false
                },
            });

            // Create User
            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    coupleId: couple.id,
                },
            });

            await login(user);
            return NextResponse.json({ success: true, user });
        }

        // JOINING EXISTING COUPLE
        const couple = await prisma.couple.findUnique({
            where: { referenceCode: inviteCode },
        });

        if (!couple) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
        }

        // Create User linked to existing couple
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                coupleId: couple.id,
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
