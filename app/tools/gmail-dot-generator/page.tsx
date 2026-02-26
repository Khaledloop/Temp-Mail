import type { Metadata } from 'next';
import { GmailDotGeneratorClient } from '@/components/tools/gmail-dot-generator/GmailDotGeneratorClient';
import {
  GMAIL_DOT_GENERATOR_FAQ,
  GMAIL_DOT_SEARCH_TERMS,
} from '@/data/gmailDotGeneratorContent';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
  /\/+$/,
  ''
);
const pageUrl = `${baseUrl}/tools/gmail-dot-generator`;
const pageTitle = 'Free Gmail Dot Generator';
const pageDescription =
  'Generate Gmail dot variations instantly with a client-side Gmail Dot Generator. Create dot-only aliases, optional googlemail variants, and +tag combinations for QA testing, signup segmentation, and inbox filtering.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    ...GMAIL_DOT_SEARCH_TERMS,
    'gmail plus alias generator',
    'googlemail alias',
    'gmail address variations',
    'gmail subaddressing',
    'email alias testing tool',
  ],
  alternates: {
    canonical: pageUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${pageTitle} | Temp Mail Lab`,
    description: pageDescription,
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Gmail Dot Generator by Temp Mail Lab',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${pageTitle} | Temp Mail Lab`,
    description: pageDescription,
    images: [`${baseUrl}/twitter-image`],
  },
};

export default function GmailDotGeneratorPage() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${pageTitle} | Temp Mail Lab`,
      description: pageDescription,
      url: pageUrl,
      inLanguage: 'en-US',
      isPartOf: {
        '@id': `${baseUrl}#website`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `${pageTitle} | Temp Mail Lab`,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      url: pageUrl,
      description: pageDescription,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Gmail dot-variant generation',
        'Optional googlemail.com aliases',
        'Optional +tag alias generation',
        'Copy all and TXT export',
        'Client-side only generation',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: GMAIL_DOT_GENERATOR_FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tools',
          item: `${baseUrl}/tools`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Gmail Dot Generator',
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GmailDotGeneratorClient />
    </>
  );
}
