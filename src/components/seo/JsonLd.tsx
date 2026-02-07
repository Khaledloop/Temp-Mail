/**
 * JSON-LD Structured Data for SEO & AI Optimization
 * Includes: SoftwareApplication, FAQPage, and Organization schemas
 */
 
export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Temp Mail',
    description: 'Temporary email address service for privacy protection.',
    url: baseUrl,
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Temp Mail - Temporary Email Address',
    description:
      'Instantly generate a free and anonymous temporary email address to protect your privacy online. No signup required.',
    applicationCategory: 'Utility',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    operatingSystem: 'Web',
    url: baseUrl,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a temporary email address?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A temporary email address is a short-lived inbox you can use to receive messages without sharing your personal email.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does the email address last?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Temporary email addresses are automatically deleted after 30 days. You can generate a new address at any time with just one click.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to sign up to use Temp Mail?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No signup is required. Temp Mail is completely anonymous and instant. Simply visit our site, generate a temporary email, and start receiving emails immediately.',
        },
      },
      {
        '@type': 'Question',
        name: 'When should I use a temporary email?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use it for sign-ups, trials, and services you do not plan to use long-term. For critical accounts, use your personal email.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}
