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
          url: `${baseUrl}/privacy#contact`,
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
        name: 'Free Temp Mail with Recovery Key (30-Day Restore) | Temp Mail Lab',
        description:
          'Create a free temp mail inbox instantly and restore access with a Recovery Key for up to 30 days.',
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
        name: 'Free Temp Mail with Recovery Key (30-Day Restore)',
        description:
          'Instantly generate free temp mail and recover the same inbox for up to 30 days using a Recovery Key. No signup required.',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        featureList: [
          'Instant disposable inbox',
          'No signup required',
          'Recovery Key inbox restore for up to 30 days',
          'Cross-session and cross-device restoration',
          'Automatic inbox expiration',
        ],
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Recovery Key retention window',
            value: 'Up to 30 days',
          },
        ],
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
            name: 'How long does a Temp Mail Lab address stay active?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Each generated address and its inbox stay available for up to 30 days, then data is removed automatically.',
            },
          },
          {
            '@type': 'Question',
            name: 'How long are received messages kept?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Messages in the temporary inbox are retained within the same 30-day lifecycle of the address.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need to sign up or share personal data?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Temp Mail Lab creates a disposable inbox instantly with no signup and no personal profile setup.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the recovery key and why should I save it?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The recovery key lets you restore access to the same temporary inbox. Save it securely because it grants inbox access.',
            },
          },
          {
            '@type': 'Question',
            name: 'When should I avoid using a temporary email?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Do not use it for banking, legal, or critical long-term accounts. Use your permanent personal email for those services.',
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
