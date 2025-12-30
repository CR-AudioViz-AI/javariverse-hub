// /app/terms/page.tsx
// Terms of Service - CR AudioViz AI

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: December 30, 2025</p>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              By accessing or using CR AudioViz AI's services, including Javari AI, you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              CR AudioViz AI provides AI-powered creative tools, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Javari AI assistant for conversations and creative tasks</li>
              <li>Logo creation and graphic design tools</li>
              <li>Document and content generation</li>
              <li>Creator Marketplace for buying and selling digital products</li>
              <li>Games and entertainment</li>
              <li>Various productivity and business tools</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Account Registration</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To use our services, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Credits and Payments</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our services use a credit-based system:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Credits are required for certain AI features</li>
              <li>Free accounts receive 50 credits monthly (expire monthly)</li>
              <li>Paid plans include credits that never expire</li>
              <li>One-time credit purchases are available</li>
              <li>Refunds are available within 7 days, no questions asked</li>
              <li>Automatic error refunds are provided</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Content Ownership</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              <strong>You own what you create.</strong> All content generated using our tools belongs to you. 
              You retain full rights to use, modify, sell, or distribute your creations commercially.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We claim no ownership over your content. You can export your work at any time and use it anywhere.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Acceptable Use</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You agree not to use our services to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Generate illegal, harmful, or abusive content</li>
              <li>Violate intellectual property rights</li>
              <li>Attempt to circumvent security measures</li>
              <li>Distribute malware or spam</li>
              <li>Harass, threaten, or impersonate others</li>
              <li>Scrape or mine data without permission</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Creator Marketplace</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you sell products on our marketplace:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>You retain 70% of each sale; we retain 30%</li>
              <li>Payouts are processed weekly</li>
              <li>You must own rights to products you sell</li>
              <li>You are responsible for customer support for your products</li>
              <li>We reserve the right to remove content that violates our policies</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              CR AudioViz AI provides services "as is" without warranties. We are not liable for any indirect, 
              incidental, or consequential damages arising from your use of our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Termination</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may suspend or terminate your account for violations of these terms. You may cancel your 
              account at any time from your settings. Upon termination, you may export your data.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may update these terms periodically. We will notify you of material changes via email or 
              in-app notification. Continued use constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Contact</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Questions about these terms? Contact us at{' '}
              <a href="mailto:support@craudiovizai.com" className="text-blue-600 hover:underline">
                support@craudiovizai.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm">
            CR AudioViz AI, LLC • Fort Myers, Florida • EIN: 93-4520864
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            <Link href="/support" className="text-blue-600 hover:underline">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
