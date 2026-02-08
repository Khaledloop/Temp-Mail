/**
 * Terms of Service page
 */

import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com')
  .replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Terms of Service - Temp Mail',
  description: 'Our terms of service.',
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Service - Temp Mail',
    description: 'Our terms of service.',
    url: `${baseUrl}/terms`,
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service - Temp Mail',
    description: 'Our terms of service.',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Terms of Service
      </h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Agreement to Terms
          </h2>
          <p>
            By accessing and using Temp Mail, you accept and agree to be bound
            by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Use License
          </h2>
          <p>
            Permission is granted to temporarily download one copy of the
            materials (information or software) on Temp Mail for personal,
            non-commercial transitory viewing only. This is the grant of a
            license, not a transfer of title, and under this license you may
            not:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose</li>
            <li>
              Attempting to decompile or reverse engineer any software
            </li>
            <li>Removing any copyright or other proprietary notations</li>
            <li>Transferring the materials to another person</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Disclaimer
          </h2>
          <p>
            The materials on Temp Mail's website are provided for educational
            purposes only. Temp Mail makes no warranties, expressed or implied,
            and hereby disclaims and negates all other warranties including,
            without limitation, implied warranties or conditions of
            merchantability, fitness for a particular purpose, or
            non-infringement of intellectual property or other violation of
            rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Contact Us
          </h2>
          <p>
            If you have any questions about these Terms and Conditions, please
            contact us at legal@tempmaillab.com
          </p>
        </section>
      </div>
    </div>
  );
}
