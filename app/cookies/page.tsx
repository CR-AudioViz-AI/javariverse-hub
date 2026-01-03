export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 mb-6">Last updated: January 2, 2026</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies</h2>
          <p className="text-slate-300 mb-4">Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li>Essential cookies for site functionality</li>
            <li>Authentication cookies to keep you logged in</li>
            <li>Analytics cookies to understand usage patterns</li>
            <li>Preference cookies to remember your settings</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Cookies</h2>
          <p className="text-slate-300 mb-4">You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p className="text-slate-300">For questions about our cookie policy, contact us at support@craudiovizai.com</p>
        </div>
      </div>
    </div>
  );
}
