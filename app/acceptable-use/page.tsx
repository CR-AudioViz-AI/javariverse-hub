import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | CRAIverse',
  description: 'Acceptable Use Policy for CRAIverse - CR AudioViz AI LLC',
};

export default function AcceptableUsePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Acceptable Use Policy</h1>
      <p className="text-gray-500 mb-8">Last Updated: December 26, 2025</p>
      
      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Prohibited Content</h2>
          <p>You may NOT create, upload, or generate:</p>
          <ul className="list-disc pl-6">
            <li>Child sexual abuse material (CSAM) - zero tolerance</li>
            <li>Non-consensual intimate imagery</li>
            <li>Weapons or dangerous substance instructions</li>
            <li>Malware, viruses, or exploit code</li>
            <li>Hate speech or content promoting violence</li>
            <li>Deliberate misinformation or deepfakes</li>
            <li>Content impersonating real individuals</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
          <ul className="list-disc pl-6">
            <li>Bypassing security measures or rate limits</li>
            <li>Reverse engineering the platform</li>
            <li>Creating multiple accounts to circumvent restrictions</li>
            <li>Reselling access without authorization</li>
            <li>Harassing other users</li>
            <li>Spamming or trolling</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Enforcement</h2>
          <p>Violations may result in:</p>
          <ul className="list-disc pl-6">
            <li>Minor violations: Warning</li>
            <li>Moderate violations: 7-30 day suspension</li>
            <li>Severe violations: Permanent ban</li>
            <li>Critical violations: Ban + report to authorities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Report Violations</h2>
          <p>Abuse: abuse@craudiovizai.com</p>
          <p>Security: security@craudiovizai.com</p>
        </section>
      </div>
    </div>
  );
}
