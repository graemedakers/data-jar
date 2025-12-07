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
