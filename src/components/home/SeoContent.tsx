/**
 * SEO Content Component - concise, structured, and useful for users + AI search
 */

const faqItems = [
  {
    q: 'How long does a Temp Mail Lab address stay active?',
    a: 'Your temporary email address and inbox stay active for up to 30 days. After that period, data is automatically removed.',
  },
  {
    q: 'How long are received messages stored?',
    a: 'Incoming emails are stored within the same 30-day lifecycle of the temporary inbox.',
  },
  {
    q: 'What is the recovery key used for?',
    a: 'The recovery key lets you restore the same inbox later. Keep it private because anyone with the key can access that inbox.',
  },
  {
    q: 'Can I use Temp Mail Lab for OTP and verification emails?',
    a: 'Yes. Temp Mail Lab is suitable for one-time signups, email verification codes, software trials, and testing account flows.',
  },
  {
    q: 'Do I need registration or personal data to use Temp Mail Lab?',
    a: 'No signup is required. You can create a disposable inbox instantly without sharing personal account details.',
  },
  {
    q: 'When should I not use a temporary email?',
    a: 'Do not use temporary email for banking, legal, healthcare, or long-term critical accounts. Use your primary permanent email for those.',
  },
]

export function SeoContent() {
  return (
    <>
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white/85 rounded-2xl shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] border border-gray-200/80 ring-1 ring-black/5 backdrop-blur-md dark:bg-white/5 dark:border-white/10 dark:ring-white/10 dark:shadow-[0_35px_90px_-55px_rgba(0,0,0,0.9)]">
        <div className="max-w-none text-gray-700 space-y-10 dark:text-gray-300">
          <section className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-gray-100">
              Temp Mail Lab: Free Temp Mail with Recovery Key
            </h2>
            <p className="text-base sm:text-lg leading-8">
              Temp Mail Lab helps you create a temporary email address instantly so you can protect your primary inbox from spam, unwanted subscriptions, and risky signups. This type of service is also called <strong>throwaway email</strong>, <strong>10 minute mail</strong>, <strong>tempmail</strong>, <strong>trash mail</strong>, and <strong>fake mail</strong>. It is designed for privacy-first users, QA teams, and anyone who needs fast email verification without long-term exposure.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-gray-100">
              Key Features That Matter
            </h3>
            <ul className="space-y-3 text-base sm:text-lg leading-8 list-disc pl-6 marker:text-gray-500 dark:marker:text-gray-400">
              <li><strong>Instant inbox creation:</strong> Generate free temp mail in seconds with no signup.</li>
              <li><strong>30-day inbox lifecycle:</strong> Address and messages stay available for up to 30 days, then auto-delete.</li>
              <li><strong>Recovery key access:</strong> Restore inbox access later using your recovery key (30-day restore).</li>
              <li><strong>Spam reduction:</strong> Keep your personal email clean by isolating one-time registrations and verification emails.</li>
              <li><strong>Cross-device usage:</strong> Open the same inbox from desktop or mobile browser.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-gray-100">
              How to Use Temp Mail Lab
            </h3>
            <ol className="space-y-3 text-base sm:text-lg leading-8 list-decimal pl-6 marker:text-gray-500 dark:marker:text-gray-400">
              <li>Open Temp Mail Lab and copy the generated temporary address.</li>
              <li>Use it on the service you want to test or sign up for.</li>
              <li>Receive verification and OTP emails instantly in the inbox panel.</li>
              <li>Save the recovery key if you may need to access the inbox again.</li>
              <li>Let the inbox expire automatically after the retention window.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-gray-100">
              Best Use Cases
            </h3>
            <p className="text-base sm:text-lg leading-8">
              Use Temp Mail Lab for social signups, software trials, marketplace registrations, QA test environments, OTP and email verification flows, and short-term privacy protection. For mission-critical accounts like banking, legal, or healthcare services, always use a permanent email account you control long term.
            </p>
          </section>
        </div>
      </article>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="not-prose space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-gray-200/80 bg-white/80 px-5 py-4 ring-1 ring-black/5 transition dark:border-white/10 dark:bg-white/5 dark:ring-white/10"
            >
              <summary className="cursor-pointer list-none text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-between gap-4">
                <span>{item.q}</span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <p className="mt-3 text-base sm:text-lg leading-8 text-gray-700 dark:text-gray-300">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
