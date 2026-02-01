import type { Metadata } from 'next';
import { SEO_SERVICES } from '@/utils/constants';

/**
 * Dynamic SEO landing pages for different services
 * Generates static pages for: facebook, instagram, discord, gmail, twitter, linkedin, reddit, twitch
 */

export async function generateStaticParams() {
  return SEO_SERVICES.map((service) => ({
    service: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { service: string };
}): Promise<Metadata> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://temp-mail-6xq.pages.dev')
    .replace(/\/+$/, '');
  const service = SEO_SERVICES.find((s) => s.slug === params.service);

  if (!service) {
    return {
      title: 'Service Not Found',
      description: 'The requested service page does not exist.',
    };
  }

  const title = `Temp Mail for ${service.name} - Disposable Email`;
  const description = `${service.description} No registration required. Create a temporary email for ${service.name} in seconds.`;

  return {
    title,
    description,
    keywords: [
      'temp mail',
      `${service.name.toLowerCase()} temp mail`,
      'temporary email',
      'disposable email',
      `${service.name.toLowerCase()} email`,
    ],
    alternates: {
      canonical: `${baseUrl}/temp-mail-for-${service.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/temp-mail-for-${service.slug}`,
    },
  };
}

export default function ServicePage({
  params,
}: {
  params: { service: string };
}) {
  const service = SEO_SERVICES.find((s) => s.slug === params.service);

  if (!service) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Service Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    );
  }

  return (
    <div>
      <section className="mb-8 rounded-xl bg-gradient-to-br from-blue-50 to-white p-8 border border-blue-100 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Temp Mail for {service.name}
        </h1>
        <p className="text-xl text-gray-600">{service.description}</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Why Use Temp Mail for {service.name}?
        </h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <span className="text-green-700 font-bold">OK</span>
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Protect Your Privacy</h3>
              <p className="text-gray-600 text-sm">
                Keep your real email private when creating a {service.name} account.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <span className="text-green-700 font-bold">OK</span>
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Avoid Spam</h3>
              <p className="text-gray-600 text-sm">
                Temporary email addresses expire after 30 days, automatically reducing spam.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <span className="text-green-700 font-bold">OK</span>
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Instant Access</h3>
              <p className="text-gray-600 text-sm">
                No signup or verification needed. Get an email address instantly.
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
