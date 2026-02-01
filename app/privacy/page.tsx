/**
 * Privacy Policy page
 */

import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://temp-mail-6xq.pages.dev')
  .replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Privacy Policy - Temp Mail',
  description: 'Our privacy policy and how we handle your data',
  alternates: {
    canonical: `${baseUrl}/privacy`,
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
            At Temp Mail, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Information We Collect
          </h2>
          <p>
            We collect minimal information. When you use Temp Mail, we collect:
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
            at privacy@temp-mail-6xq.pages.dev
          </p>
        </section>
      </div>
    </div>
  );
}

