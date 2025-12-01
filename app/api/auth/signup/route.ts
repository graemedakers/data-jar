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
            // NEW COUPLE: Redirect to Stripe for payment BEFORE creating records
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: process.env.STRIPE_PRICE_ID,
                        quantity: 1,
                    },
                ],
                metadata: {
                    type: 'NEW_COUPLE_SIGNUP',
                    name,
                    email,
                    passwordHash,
                    location: location || '',
                },
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup`,
            });

            return NextResponse.json({ checkoutUrl: session.url });
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
