import { Metadata } from 'next'

interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  noIndex?: boolean
}

const baseUrl = 'https://salonbooking.lk'
const defaultImage = '/og-image.jpg'

export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors = ['SalonBooking.lk Team'],
    noIndex = false
  } = config

  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullTitle = title ? `${title} | SalonBooking.lk` : 'SalonBooking.lk - Book Premium Salon Services in Sri Lanka'

  return {
    title: fullTitle,
    description,
    keywords: [
      ...keywords,
      'salon booking Sri Lanka',
      'beauty services',
      'haircut',
      'facial',
      'massage',
      'spa'
    ],
    authors: authors.map(name => ({ name })),
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      type,
      siteName: 'SalonBooking.lk',
      locale: 'en_LK',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || 'SalonBooking.lk',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@salonbookinglk',
    },
  }
}

// Pre-defined SEO configs for common pages
export const seoConfigs = {
  home: {
    title: 'Book Premium Salon Services in Sri Lanka',
    description: 'Sri Lanka\'s premier salon booking platform. Find and book beauty services, haircuts, facials, massages and more at top-rated salons across Sri Lanka.',
    keywords: ['salon booking', 'beauty services Sri Lanka', 'haircut booking', 'spa services'],
  },
  
  search: {
    title: 'Search Salons and Services',
    description: 'Search and discover the best salons and beauty services near you in Sri Lanka. Filter by location, service type, price and ratings.',
    keywords: ['search salons', 'find beauty services', 'salon near me', 'beauty search'],
  },
  
  salons: {
    title: 'Browse All Salons in Sri Lanka',
    description: 'Discover verified salons across Sri Lanka. Browse by location, services offered, ratings and book your perfect beauty appointment.',
    keywords: ['Sri Lanka salons', 'verified salons', 'salon directory', 'beauty salons'],
  },
  
  categories: {
    title: 'Beauty Service Categories',
    description: 'Explore different beauty service categories including haircuts, facials, massages, nail services and more.',
    keywords: ['beauty categories', 'service types', 'haircut', 'facial', 'massage', 'nails'],
  },
}

// Function to generate salon-specific SEO
export function generateSalonSEO(salonName: string, description: string, location: string, services: string[]): Metadata {
  return generateSEO({
    title: `${salonName} - Premium Salon in ${location}`,
    description: `${description} Book appointments at ${salonName} in ${location}. Services include ${services.slice(0, 3).join(', ')} and more.`,
    keywords: [
      salonName,
      `salon in ${location}`,
      ...services,
      'beauty services',
      'professional salon'
    ],
    type: 'article',
  })
}

// Function to generate service-specific SEO
export function generateServiceSEO(serviceName: string, salonName: string, price: number, description: string): Metadata {
  return generateSEO({
    title: `${serviceName} at ${salonName} - LKR ${price.toLocaleString()}`,
    description: `${description} Book ${serviceName} at ${salonName} for LKR ${price.toLocaleString()}. Professional service with experienced stylists.`,
    keywords: [
      serviceName,
      salonName,
      'professional service',
      'beauty treatment',
      'salon booking'
    ],
    type: 'article',
  })
}

// Function to generate category-specific SEO
export function generateCategorySEO(category: string, serviceCount: number): Metadata {
  const categoryTitles: { [key: string]: string } = {
    haircut: 'Professional Haircuts',
    coloring: 'Hair Coloring Services', 
    styling: 'Hair Styling Services',
    facial: 'Facial Treatments',
    massage: 'Massage Therapy',
    nails: 'Nail Services',
    skincare: 'Skincare Treatments'
  }
  
  const title = categoryTitles[category] || category
  
  return generateSEO({
    title: `${title} in Sri Lanka`,
    description: `Find the best ${title.toLowerCase()} in Sri Lanka. Choose from ${serviceCount}+ verified services at top-rated salons. Book online with instant confirmation.`,
    keywords: [
      category,
      `${category} Sri Lanka`,
      `professional ${category}`,
      `${category} services`,
      'beauty treatment'
    ],
  })
}
