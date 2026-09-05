import { MetadataRoute } from 'next';

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mudasirch.netlify.app';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/admin/', '/admin/dashboard', '/admin/dashboard/'],
            },
        ],
        host: siteUrl,
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
