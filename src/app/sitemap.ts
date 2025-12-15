import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://mudasirchoudhry.com',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: 'https://mudasirchoudhry.com/admin',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.1, // Hide from search results essentially
        },
    ];
}
