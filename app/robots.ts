import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/scan/'],
      },
    ],
    sitemap: 'https://dolj-mig.se/sitemap.xml',
    host: 'https://dolj-mig.se',
  }
}
