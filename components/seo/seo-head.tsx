"use client";

import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  structuredData?: object;
}

export default function SEOHead({
  title,
  description,
  keywords,
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  structuredData
}: SEOHeadProps) {
  const fullUrl = `https://salonbooking.lk${url}`;
  const fullTitle = title.includes('SalonBooking.lk') ? title : `${title} | SalonBooking.lk`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={`https://salonbooking.lk${image}`} />
      <meta property="og:site_name" content="SalonBooking.lk" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://salonbooking.lk${image}`} />
      <meta name="twitter:creator" content="@salonbookinglk" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
}
