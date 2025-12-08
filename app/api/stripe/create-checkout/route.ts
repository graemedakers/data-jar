import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { couple: true },
        });

        if (!user || !user.couple) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { discountCode } = await request.json().catch(() => ({}));

        // 1. Check for special "VIP" codes that grant free access directly
        const VIP_CODES = ['DATEJAR_VIP', 'LOVE_IS_FREE', 'BETA_TESTER'];
        if (discountCode && VIP_CODES.includes(discountCode.toUpperCase())) {
            await prisma.couple.update({
                where: { id: user.couple.id },
                data: { isPremium: true },
            });
            return NextResponse.json({ success: true, message: 'Premium activated successfully!' });
        }

        // 2. Create Stripe Checkout Session (Subscription Mode)
        const priceId = process.env.STRIPE_PRICE_ID;

        if (!priceId) {
            console.error("Missing STRIPE_PRICE_ID in env");
            return NextResponse.json({ error: 'System configuration error: Price ID missing' }, { status: 500 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription', // CHANGED to subscription
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?premium_success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?premium_cancel=true`,
            customer_email: user.email,
            metadata: {
                coupleId: user.couple.id,
                type: 'SUBSCRIPTION_UPGRADE'
            },
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
        });

        return NextResponse.json({ url: checkoutSession.url });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
