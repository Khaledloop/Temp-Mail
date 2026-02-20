/**
 * JSON-LD Structured Data for SEO + GEO (LLM discoverability)
 */

export function JsonLd() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com').replace(/\/+$/, '');

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: 'Temp Mail Lab',
        description: 'Temporary email address service for privacy protection.',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/icon-192x192.png`,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'support@tempmaillab.com',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
        url: baseUrl,
        name: 'Temp Mail Lab',
        description: 'Free disposable email inboxes for privacy and anti-spam protection.',
        publisher: {
          '@id': `${baseUrl}#organization`,
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}#webpage`,
        url: baseUrl,
        name: 'Temp Mail Lab - Free Temporary Email Address',
        description: 'Generate an anonymous temporary inbox in seconds with no signup required.',
        isPartOf: {
          '@id': `${baseUrl}#website`,
        },
        about: {
          '@id': `${baseUrl}#organization`,
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${baseUrl}/opengraph-image`,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${baseUrl}#app`,
        name: 'Temp Mail Lab - Temporary Email Address',
        description:
          'Instantly generate a free and anonymous temporary email address to protect your privacy online. No signup required.',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        url: baseUrl,
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}#faq`,
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
            name: 'Do I need to sign up to use Temp Mail Lab?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No signup is required. Temp Mail Lab is completely anonymous and instant. Simply visit our site, generate a temporary email, and start receiving emails immediately.',
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
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph),
      }}
    />
  );
}
