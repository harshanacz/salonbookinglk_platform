import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://salonbooking.lk'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/salon-owner/',
          '/user/profile',
          '/api/',
          '/checkout/',
          '/after-sign-up/',
          '/reset-password/',
          '/forgot-password/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/salon-owner/',
          '/user/profile',
          '/api/',
          '/checkout/',
          '/after-sign-up/',
          '/reset-password/',
          '/forgot-password/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
