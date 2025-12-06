
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, address, description, websiteUrl, googleRating, type } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const id = crypto.randomUUID();

        // Using raw SQL to bypass valid Prisma Client generation issues
        await prisma.$executeRaw`
            INSERT INTO "FavoriteVenue" ("id", "coupleId", "userId", "name", "address", "description", "websiteUrl", "googleRating", "type", "createdAt")
            VALUES (${id}, ${session.user.coupleId}, ${session.user.id}, ${name}, ${address}, ${description}, ${websiteUrl}, ${googleRating}, ${type || 'VENUE'}, NOW())
        `;

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error("Error adding favorite:", error);
        return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Using raw SQL to bypass valid Prisma Client generation issues
        await prisma.$executeRaw`
            DELETE FROM "FavoriteVenue" WHERE "coupleId" = ${session.user.coupleId} AND "name" = ${name}
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting favorite:", error);
        return NextResponse.json({ error: "Failed to delete favorite" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Using raw SQL to bypass valid Prisma Client generation issues
        const favorites = await prisma.$queryRaw`
            SELECT * FROM "FavoriteVenue" WHERE "coupleId" = ${session.user.coupleId} ORDER BY "createdAt" DESC
        `;

        return NextResponse.json(favorites);
    } catch (error: any) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
    }
}
