import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const metadata = session.metadata;

        if (metadata?.type === 'NEW_COUPLE_SIGNUP') {
            const { name, email, passwordHash, location } = metadata;

            if (!name || !email || !passwordHash) {
                return new NextResponse('Webhook Error: Missing user details in metadata', { status: 400 });
            }

            // Create Couple
            const referenceCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const couple = await prisma.couple.create({
                data: {
                    referenceCode,
                    location: location || null,
                    isPremium: true,
                },
            });

            // Create User
            await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    coupleId: couple.id,
                },
            });
        } else if (metadata?.coupleId) {
            // Existing upgrade flow
            await prisma.couple.update({
                where: {
                    id: metadata.coupleId,
                },
                data: {
                    isPremium: true,
                },
            });
        } else {
            return new NextResponse('Webhook Error: Missing metadata', { status: 400 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
