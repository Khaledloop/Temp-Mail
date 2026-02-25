import type { Metadata } from 'next';
import { PasswordGeneratorClient } from '@/components/tools/password-generator/PasswordGeneratorClient';
import { PASSWORD_GENERATOR_FAQ } from '@/data/passwordGeneratorContent';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(
  /\/+$/,
  ''
);
const pageUrl = `${baseUrl}/tools/password-generator`;
const pageTitle = 'Free Password Generator';
const pageDescription =
  'Generate secure passwords and passphrases instantly with a privacy-first password generator. Local browser generation, entropy score, and practical security guidance.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'password generator',
    'strong password generator',
    'secure password',
    'passphrase generator',
    'random password',
    'account security',
    'password strength checker',
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
        alt: 'Temp Mail Lab Password Generator',
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

export default function PasswordGeneratorPage() {
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
      applicationCategory: 'SecurityApplication',
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
        'Random password generation',
        'Passphrase generation',
        'Entropy-based strength scoring',
        'Local browser-only generation',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: PASSWORD_GENERATOR_FAQ.map((item) => ({
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
          name: 'Password Generator',
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
      <PasswordGeneratorClient />
    </>
  );
}
