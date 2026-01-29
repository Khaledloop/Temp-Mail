/**
 * JSON-LD Structured Data for SEO & AI Optimization
 * Includes: SoftwareApplication, FAQPage, and Organization schemas
 */

export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Temp Mail',
    description: 'Free temporary email address service for privacy protection',
    url: 'https://tempmail.example.com',
    logo: 'https://tempmail.example.com/logo.png',
    sameAs: [
      'https://twitter.com/tempmail',
      'https://facebook.com/tempmail',
    ],
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Temp Mail - Temporary Email Address',
    description:
      'Instantly generate a free, secure, and anonymous temporary email address to protect your privacy online. No signup required.',
    applicationCategory: 'Utility',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    operatingSystem: 'Web',
    url: 'https://tempmail.example.com',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this email address secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Temp Mail provides a high level of security by generating completely anonymous temporary email addresses that are not linked to your personal identity. All emails are encrypted in transit.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does the email address last?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Temporary email addresses are automatically deleted after 24 hours. You can generate a new address at any time with just one click.',
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
        name: 'Can I use this email for important accounts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Temp Mail is ideal for sign-ups, registrations, and services you do not plan to use long-term. For important accounts, we recommend using your personal email address.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Temp Mail free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Temp Mail is completely free. You can generate unlimited temporary email addresses at no cost.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I protect against spam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Temp Mail helps you protect against spam by providing a temporary email address that is isolated from your personal inbox. Simply use your temporary address for untrusted sources and switch to a new one if needed.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I receive attachments?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Temp Mail supports receiving emails with attachments. You can view and download attachments directly from the Temp Mail inbox.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data stored or logged?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Temp Mail does not store logs of your activity. Your temporary email and inbox data are automatically deleted after 24 hours.',
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
