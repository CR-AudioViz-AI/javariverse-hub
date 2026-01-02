'use client';

import { useState } from 'react';
import { QrCode, Download, Copy, Palette, Link, Mail, Phone, Wifi, MapPin, Calendar, CreditCard } from 'lucide-react';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'location' | 'event' | 'vcard';

interface QRConfig {
  type: QRType;
  data: string;
  size: number;
  fgColor: string;
  bgColor: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

export default function QRGeneratorPage() {
  const [config, setConfig] = useState<QRConfig>({
    type: 'url',
    data: '',
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    errorCorrection: 'M'
  });

  const [wifiConfig, setWifiConfig] = useState({
    ssid: '',
    password: '',
    encryption: 'WPA'
  });

  const [vcardConfig, setVcardConfig] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    website: ''
  });

  const [eventConfig, setEventConfig] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const qrTypes: { id: QRType; label: string; icon: React.ElementType }[] = [
    { id: 'url', label: 'URL', icon: Link },
    { id: 'text', label: 'Text', icon: QrCode },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'event', label: 'Event', icon: Calendar },
    { id: 'vcard', label: 'Contact Card', icon: CreditCard }
  ];

  const generateQRData = (): string => {
    switch (config.type) {
      case 'url':
        return config.data;
      case 'text':
        return config.data;
      case 'email':
        return `mailto:${config.data}`;
      case 'phone':
        return `tel:${config.data}`;
      case 'wifi':
        return `WIFI:T:${wifiConfig.encryption};S:${wifiConfig.ssid};P:${wifiConfig.password};;`;
      case 'location':
        return `geo:${config.data}`;
      case 'event':
        return `BEGIN:VEVENT\nSUMMARY:${eventConfig.title}\nLOCATION:${eventConfig.location}\nDTSTART:${eventConfig.startDate}\nDTEND:${eventConfig.endDate}\nDESCRIPTION:${eventConfig.description}\nEND:VEVENT`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardConfig.lastName};${vcardConfig.firstName}\nFN:${vcardConfig.firstName} ${vcardConfig.lastName}\nORG:${vcardConfig.company}\nTITLE:${vcardConfig.title}\nTEL:${vcardConfig.phone}\nEMAIL:${vcardConfig.email}\nURL:${vcardConfig.website}\nEND:VCARD`;
      default:
        return config.data;
    }
  };

  const qrData = generateQRData();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${config.size}x${config.size}&data=${encodeURIComponent(qrData)}&color=${config.fgColor.replace('#', '')}&bgcolor=${config.bgColor.replace('#', '')}&ecc=${config.errorCorrection}`;

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">QR Code Generator</h1>
                <p className="text-sm text-gray-400">Create custom QR codes instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                <Copy className="w-4 h-4" />
                Copy Data
              </button>
              <button
                onClick={downloadQR}
                disabled={!qrData}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* QR Type Selection */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">QR Code Type</h3>
              <div className="grid grid-cols-4 gap-2">
                {qrTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setConfig(prev => ({ ...prev, type: type.id, data: '' }))}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition ${config.type === type.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    <type.icon className="w-5 h-5" />
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Input */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Content</h3>
              
              {config.type === 'wifi' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiConfig.ssid}
                      onChange={(e) => setWifiConfig(prev => ({ ...prev, ssid: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="MyWiFiNetwork"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Password</label>
                    <input
                      type="password"
                      value={wifiConfig.password}
                      onChange={(e) => setWifiConfig(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="********"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Encryption</label>
                    <select
                      value={wifiConfig.encryption}
                      onChange={(e) => setWifiConfig(prev => ({ ...prev, encryption: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </div>
                </div>
              ) : config.type === 'vcard' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">First Name</label>
                      <input
                        type="text"
                        value={vcardConfig.firstName}
                        onChange={(e) => setVcardConfig(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={vcardConfig.lastName}
                        onChange={(e) => setVcardConfig(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={vcardConfig.email}
                      onChange={(e) => setVcardConfig(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={vcardConfig.phone}
                      onChange={(e) => setVcardConfig(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Company</label>
                    <input
                      type="text"
                      value={vcardConfig.company}
                      onChange={(e) => setVcardConfig(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ) : config.type === 'event' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Event Title</label>
                    <input
                      type="text"
                      value={eventConfig.title}
                      onChange={(e) => setEventConfig(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={eventConfig.location}
                      onChange={(e) => setEventConfig(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Start</label>
                      <input
                        type="datetime-local"
                        value={eventConfig.startDate}
                        onChange={(e) => setEventConfig(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">End</label>
                      <input
                        type="datetime-local"
                        value={eventConfig.endDate}
                        onChange={(e) => setEventConfig(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    {config.type === 'url' && 'Website URL'}
                    {config.type === 'text' && 'Text Content'}
                    {config.type === 'email' && 'Email Address'}
                    {config.type === 'phone' && 'Phone Number'}
                    {config.type === 'location' && 'Coordinates (lat,lng)'}
                  </label>
                  <input
                    type={config.type === 'email' ? 'email' : config.type === 'phone' ? 'tel' : config.type === 'url' ? 'url' : 'text'}
                    value={config.data}
                    onChange={(e) => setConfig(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={
                      config.type === 'url' ? 'https://example.com' :
                      config.type === 'email' ? 'hello@example.com' :
                      config.type === 'phone' ? '+1 555 123 4567' :
                      config.type === 'location' ? '40.7128,-74.0060' :
                      'Enter your text...'
                    }
                  />
                </div>
              )}
            </div>

            {/* Customization */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Customize
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Size</label>
                  <select
                    value={config.size}
                    onChange={(e) => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="128">Small (128px)</option>
                    <option value="256">Medium (256px)</option>
                    <option value="512">Large (512px)</option>
                    <option value="1024">XL (1024px)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Error Correction</label>
                  <select
                    value={config.errorCorrection}
                    onChange={(e) => setConfig(prev => ({ ...prev, errorCorrection: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Foreground Color</label>
                  <input
                    type="color"
                    value={config.fgColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, fgColor: e.target.value }))}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, bgColor: e.target.value }))}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Preview</h3>
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              {qrData ? (
                <>
                  <div 
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <img
                      src={qrUrl}
                      alt="QR Code"
                      className="max-w-full"
                      style={{ width: Math.min(config.size, 300), height: Math.min(config.size, 300) }}
                    />
                  </div>
                  <p className="mt-4 text-sm text-gray-400 text-center max-w-xs break-all">
                    {qrData.length > 100 ? qrData.substring(0, 100) + '...' : qrData}
                  </p>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <QrCode className="w-24 h-24 mx-auto mb-4 opacity-20" />
                  <p>Enter content to generate QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
