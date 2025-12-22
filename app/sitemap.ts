import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://date-jar.com';

    const routes = [
        '',
        '/login',
        '/signup',
        '/premium',
        '/privacy',
        '/terms',
        '/forgot-password',
        '/science',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));
}
