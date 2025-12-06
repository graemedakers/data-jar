import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Date Jar',
        short_name: 'Date Jar',
        description: 'A fun, interactive way for couples to decide on their next date.',
        start_url: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#ec4899',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
