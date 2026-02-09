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
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://tempmaillab.com')
    .replace(/\/+$/, '');
  const service = SEO_SERVICES.find((s) => s.slug === params.service);

  if (!service) {
    return {
      title: 'Service Not Found',
      description: 'The requested service page does not exist.',
    };
  }

  const title = `Temp Mail Lab for ${service.name} - Disposable Email`;
  const description = `${service.description} No registration required. Create a temporary email for ${service.name} in seconds.`;
  const ogImage = `${baseUrl}/og-image.png`;
  const twitterImage = `${baseUrl}/twitter-image.png`;

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
      canonical: `${baseUrl}/temp-mail-for/${service.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/temp-mail-for/${service.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Temp Mail Lab for ${service.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [twitterImage],
    },
  };
}

export default function ServicePage({
  params,
}: {
  params: { service: string };
}) {
  const service = SEO_SERVICES.find((s) => s.slug === params.service);
  const otherServices = SEO_SERVICES.filter((s) => s.slug !== params.service).slice(0, 6);

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
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white p-8 border border-blue-100 shadow-sm">
        <h1 className="text-4xl font-black text-gray-900 mb-3">
          Temp Mail Lab for {service.name}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          {service.description}. Use a <strong>disposable email address</strong> to sign up for {service.name}
          without exposing your real inbox. Your temporary email stays active for 30 days and keeps spam away.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-white/70 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">Instant</p>
            <p className="mt-2 text-sm text-gray-700">Get an email in seconds. No signup required.</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-white/70 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">Private</p>
            <p className="mt-2 text-sm text-gray-700">Shield your real address from tracking and spam.</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-white/70 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">30 Days</p>
            <p className="mt-2 text-sm text-gray-700">Emails auto-expire, reducing long‑term exposure.</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-black text-gray-900 mb-4">
          Why Use Temp Mail Lab for {service.name}?
        </h2>
        <p className="text-gray-700 text-base leading-relaxed">
          Creating a {service.name} account often means sharing your email with third parties. With Temp Mail Lab,
          you can protect your identity and reduce exposure to unsolicited marketing. It is a simple, secure, and
          fast alternative that keeps your main inbox clean.
        </p>
        <ul className="mt-6 space-y-4">
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
              <h3 className="font-semibold text-gray-900">Reduce Spam</h3>
              <p className="text-gray-600 text-sm">
                Temporary email addresses expire after 30 days, so spam doesn’t follow you.
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

      <section className="mb-12">
        <h2 className="text-2xl font-black text-gray-900 mb-4">How it works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>
            Open Temp Mail Lab and copy your new <strong>temporary email</strong>.
          </li>
          <li>
            Paste it into the {service.name} signup form.
          </li>
          <li>
            Read verification emails in your Temp Mail Lab inbox.
          </li>
          <li>
            The address expires automatically after 30 days.
          </li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-black text-gray-900 mb-4">
          Best use cases for {service.name}
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Testing a new {service.name} account before committing.</li>
          <li>Creating multiple accounts for QA or automation workflows.</li>
          <li>Reducing tracking from ads and newsletters.</li>
          <li>Keeping personal and testing accounts separate.</li>
        </ul>
      </section>

      {otherServices.length ? (
        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Explore other service pages</h2>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm text-gray-700">
            {otherServices.map((item) => (
              <li key={item.slug}>
                <a
                  href={`/temp-mail-for/${item.slug}`}
                  className="underline underline-offset-4 hover:text-gray-900"
                >
                  Temp Mail Lab for {item.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
