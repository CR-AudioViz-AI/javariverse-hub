'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MobileInput, MobileTextarea, MobileButton } from '@/components/mobile';
import { Mail, Phone, MapPin, MessageCircle, Check } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement actual form submission (email service, database, etc.)
      // For now, simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: '',
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 to-cyan-500 text-white px-4 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-cyan-100">
              Have a question? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* Contact Info Cards */}
              <div className="space-y-4 md:space-y-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <a 
                          href="mailto:support@craudiovizai.com" 
                          className="text-sm text-blue-600 hover:underline block"
                        >
                          support@craudiovizai.com
                        </a>
                        <a 
                          href="mailto:sales@craudiovizai.com" 
                          className="text-sm text-blue-600 hover:underline block"
                        >
                          sales@craudiovizai.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 md:w-6 md:h-6 text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                        <a 
                          href="tel:1-800-CR-AUDIO" 
                          className="text-sm text-cyan-500 hover:underline block"
                        >
                          1-800-CR-AUDIO
                        </a>
                        <p className="text-sm text-gray-600">Mon-Fri, 9am-6pm EST</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 md:w-6 md:h-6 text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
                        <p className="text-sm text-gray-600">Fort Myers, Florida</p>
                        <p className="text-sm text-gray-600">United States</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hidden md:block">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                        <p className="text-sm text-gray-600 mb-2">Available 24/7</p>
                        <MobileButton size="sm" variant="outline">
                          Start Chat
                        </MobileButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                      Send us a message
                    </h2>

                    {/* Success Message */}
                    {success && (
                      <div className="mb-6 bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4 flex items-start gap-3">
                        <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-900 font-semibold">Message sent successfully!</p>
                          <p className="text-cyan-600 text-sm mt-1">
                            We'll get back to you within 24 hours.
                          </p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Name Fields - Stack on mobile, side-by-side on desktop */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MobileInput
                          type="text"
                          label="First Name"
                          value={formData.firstName}
                          onChange={handleChange('firstName')}
                          required
                          disabled={loading}
                          placeholder="John"
                        />
                        <MobileInput
                          type="text"
                          label="Last Name"
                          value={formData.lastName}
                          onChange={handleChange('lastName')}
                          required
                          disabled={loading}
                          placeholder="Doe"
                        />
                      </div>

                      {/* Email */}
                      <MobileInput
                        type="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        required
                        disabled={loading}
                        placeholder="john@example.com"
                        icon={<Mail className="w-5 h-5" />}
                      />

                      {/* Subject */}
                      <MobileInput
                        type="text"
                        label="Subject"
                        value={formData.subject}
                        onChange={handleChange('subject')}
                        required
                        disabled={loading}
                        placeholder="How can we help?"
                      />

                      {/* Message */}
                      <MobileTextarea
                        label="Message"
                        value={formData.message}
                        onChange={handleChange('message')}
                        required
                        disabled={loading}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                      />

                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <MobileButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                        className="bg-cyan-500 hover:bg-cyan-600"
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </MobileButton>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
