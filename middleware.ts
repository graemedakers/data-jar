import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.AUTH_SECRET || "secret-key-change-me-in-prod";
const key = new TextEncoder().encode(secretKey);

async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function middleware(request: NextRequest) {
    // Redirect logged-in users from landing page to dashboard
    if (request.nextUrl.pathname === '/') {
        const session = request.cookies.get('session')?.value;
        if (session) {
            try {
                await decrypt(session);
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } catch (error) {
                // Session invalid, let them stay on landing page
                return NextResponse.next();
            }
        }
    }

    // Protect dashboard and feature routes
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/jar') ||
        request.nextUrl.pathname.startsWith('/memories')) {
        const session = request.cookies.get('session')?.value;

        if (!session) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            await decrypt(session);
            // Session is valid
            return NextResponse.next();
        } catch (error) {
            // Session invalid
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/jar/:path*', '/memories/:path*'],
}
