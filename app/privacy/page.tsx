/**
 * Privacy Policy page
 */

import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com')
  .replace(/\/+$/, '');
const privacyDescription =
  "Read Temp Mail Lab's Privacy Policy to understand what data we collect, how temporary inbox emails are stored and deleted after 30 days, and how to contact us.";

export const metadata: Metadata = {
  title: 'Privacy Policy - Temp Mail Lab',
  description: privacyDescription,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy - Temp Mail Lab',
    description: privacyDescription,
    url: `${baseUrl}/privacy`,
    type: 'article',
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Temp Mail Lab Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - Temp Mail Lab',
    description: privacyDescription,
    images: [`${baseUrl}/twitter-image`],
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Introduction
          </h2>
          <p>
            At Temp Mail Lab, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Information We Collect
          </h2>
          <p>
            We collect minimal information. When you use Temp Mail Lab, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your temporary email address</li>
            <li>Emails received at your temporary address</li>
            <li>Basic usage analytics (non-identifying)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Data Storage and Deletion
          </h2>
          <p>
            All temporary email addresses and their contents are automatically
            deleted after 30 days. We do not retain any personal data beyond
            this period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at privacy@tempmaillab.com
          </p>
        </section>
      </div>
    </div>
  );
}

