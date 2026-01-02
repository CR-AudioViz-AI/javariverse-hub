'use client';

import { useState } from 'react';
import { Mail, Download, Copy, Sparkles, Eye, Code, Palette, Layout, Image, Type, Square } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  preview: string;
  html: string;
}

const templates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    category: 'Onboarding',
    preview: '👋 Welcome new users with style',
    html: ''
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'Marketing',
    preview: '📰 Keep subscribers informed',
    html: ''
  },
  {
    id: 'promotional',
    name: 'Promotional',
    category: 'Sales',
    preview: '🎉 Drive conversions',
    html: ''
  },
  {
    id: 'transactional',
    name: 'Order Confirmation',
    category: 'Transactional',
    preview: '✅ Confirm purchases',
    html: ''
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    category: 'Transactional',
    preview: '🔐 Secure account recovery',
    html: ''
  },
  {
    id: 'feedback',
    name: 'Feedback Request',
    category: 'Engagement',
    preview: '⭐ Collect user feedback',
    html: ''
  }
];

export default function EmailTemplatesPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'builder' | 'code'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [emailConfig, setEmailConfig] = useState({
    subject: '',
    preheader: '',
    logoUrl: '',
    headerText: '',
    bodyText: '',
    ctaText: 'Get Started',
    ctaUrl: '',
    footerText: '',
    primaryColor: '#6366f1',
    backgroundColor: '#f3f4f6',
    fontFamily: 'Arial, sans-serif'
  });

  const generateEmailHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailConfig.subject}</title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <style>
    body { margin: 0; padding: 0; font-family: ${emailConfig.fontFamily}; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: ${emailConfig.primaryColor}; padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content p { color: #374151; line-height: 1.6; font-size: 16px; }
    .cta-button { display: inline-block; background: ${emailConfig.primaryColor}; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body style="background: ${emailConfig.backgroundColor}; padding: 20px;">
  <div class="container">
    <div class="header">
      ${emailConfig.logoUrl ? `<img src="${emailConfig.logoUrl}" alt="Logo" style="max-width: 150px; margin-bottom: 20px;">` : ''}
      <h1>${emailConfig.headerText || 'Welcome!'}</h1>
    </div>
    <div class="content">
      <p>${emailConfig.bodyText || 'Your email content goes here. Make it engaging and valuable for your readers.'}</p>
      ${emailConfig.ctaUrl ? `<p style="text-align: center;"><a href="${emailConfig.ctaUrl}" class="cta-button">${emailConfig.ctaText}</a></p>` : ''}
    </div>
    <div class="footer">
      <p>${emailConfig.footerText || '© 2026 Your Company. All rights reserved.'}</p>
      <p><a href="#" style="color: #6b7280;">Unsubscribe</a> | <a href="#" style="color: #6b7280;">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`.trim();
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(generateEmailHTML());
  };

  const downloadHTML = () => {
    const blob = new Blob([generateEmailHTML()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Email Template Builder</h1>
                <p className="text-sm text-gray-400">Create beautiful, responsive emails</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </button>
              <button
                onClick={copyHTML}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                <Copy className="w-4 h-4" />
                Copy HTML
              </button>
              <button
                onClick={downloadHTML}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'templates' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Layout className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'builder' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Square className="w-4 h-4" />
            Builder
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'code' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Code className="w-4 h-4" />
            HTML Code
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            {activeTab === 'templates' && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Choose a Template</h3>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-xl text-left transition ${selectedTemplate?.id === template.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                    >
                      <div className="text-2xl mb-2">{template.preview.split(' ')[0]}</div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm opacity-70">{template.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'builder' && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-6">
                {/* Content Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Content
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Subject Line</label>
                      <input
                        type="text"
                        value={emailConfig.subject}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Your amazing subject line"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Header Text</label>
                      <input
                        type="text"
                        value={emailConfig.headerText}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, headerText: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Welcome to Our Platform!"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Body Content</label>
                      <textarea
                        value={emailConfig.bodyText}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, bodyText: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Write your email content here..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={emailConfig.ctaText}
                          onChange={(e) => setEmailConfig(prev => ({ ...prev, ctaText: e.target.value }))}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">CTA URL</label>
                        <input
                          type="url"
                          value={emailConfig.ctaUrl}
                          onChange={(e) => setEmailConfig(prev => ({ ...prev, ctaUrl: e.target.value }))}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="https://"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Style Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Styling
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Primary Color</label>
                      <input
                        type="color"
                        value={emailConfig.primaryColor}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Background Color</label>
                      <input
                        type="color"
                        value={emailConfig.backgroundColor}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Branding Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Branding
                  </h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={emailConfig.logoUrl}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://your-logo.png"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">HTML Source</h3>
                <pre className="bg-black/50 rounded-xl p-4 overflow-auto max-h-[600px] text-sm text-gray-300">
                  <code>{generateEmailHTML()}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </h3>
            <div 
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: emailConfig.backgroundColor }}
            >
              <iframe
                srcDoc={generateEmailHTML()}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
