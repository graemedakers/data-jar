import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getItinerary(details?: string | null) {
    if (!details) return null;
    try {
        let data = JSON.parse(details);
        // Handle potential double-stringification
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { }
        }
        // Check for schedule array
        if (data && typeof data === 'object' && Array.isArray(data.schedule)) return data;
    } catch (e) { return null; }
    return null;
}

export function getApiUrl(path: string) {
    if (path.startsWith('http')) return path;

    // If running on client side, use relative path to ensure we hit the same origin
    if (typeof window !== 'undefined') {
        return path.startsWith('/') ? path : `/${path}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
}

export function isCapacitor() {
    if (typeof window !== 'undefined') {
        return (window as any).Capacitor?.isNativePlatform();
    }
    return false;
}
