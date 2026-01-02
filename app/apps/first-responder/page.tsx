'use client';

import { useState } from 'react';
import { Flame, Stethoscope, Shield, FileText, AlertTriangle, Clock, MapPin, Phone, Radio, Clipboard, Heart, Users, Download, ChevronRight } from 'lucide-react';

type ResponderType = 'fire' | 'ems' | 'police' | 'dispatch';

interface Tool {
  id: string;
  title: string;
  description: string;
  types: ResponderType[];
  icon: React.ElementType;
  action: string;
}

const tools: Tool[] = [
  {
    id: 'incident-report',
    title: 'Incident Report Generator',
    description: 'AI-assisted incident documentation with standardized formats',
    types: ['fire', 'ems', 'police'],
    icon: FileText,
    action: '/apps/pdf-builder'
  },
  {
    id: 'patient-care',
    title: 'Patient Care Report',
    description: 'NEMSIS-compliant PCR documentation',
    types: ['ems'],
    icon: Stethoscope,
    action: '#'
  },
  {
    id: 'fire-report',
    title: 'Fire Investigation Report',
    description: 'NFIRS-compliant fire incident reporting',
    types: ['fire'],
    icon: Flame,
    action: '#'
  },
  {
    id: 'shift-scheduler',
    title: 'Shift Scheduler',
    description: '24/48, Kelly, and custom shift patterns',
    types: ['fire', 'ems', 'police', 'dispatch'],
    icon: Clock,
    action: '#'
  },
  {
    id: 'training-tracker',
    title: 'Training & Certification Tracker',
    description: 'Track CEUs, certifications, and renewal dates',
    types: ['fire', 'ems', 'police'],
    icon: Clipboard,
    action: '#'
  },
  {
    id: 'community-outreach',
    title: 'Community Outreach Materials',
    description: 'Create flyers, social media, and educational content',
    types: ['fire', 'ems', 'police'],
    icon: Users,
    action: '/apps/social-graphics'
  }
];

const quickStats = [
  { label: 'First Responders Nationwide', value: '2.5M+' },
  { label: 'Annual Emergency Calls', value: '240M' },
  { label: 'Fire Departments', value: '29,705' },
  { label: 'EMS Agencies', value: '21,283' }
];

export default function FirstResponderPage() {
  const [selectedType, setSelectedType] = useState<ResponderType | 'all'>('all');

  const responderTypes: { id: ResponderType | 'all'; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'all', label: 'All Services', icon: Shield, color: 'bg-gray-600' },
    { id: 'fire', label: 'Fire/Rescue', icon: Flame, color: 'bg-red-600' },
    { id: 'ems', label: 'EMS', icon: Stethoscope, color: 'bg-blue-600' },
    { id: 'police', label: 'Law Enforcement', icon: Shield, color: 'bg-indigo-600' },
    { id: 'dispatch', label: 'Dispatch/911', icon: Radio, color: 'bg-green-600' }
  ];

  const filteredTools = tools.filter(tool => 
    selectedType === 'all' || tool.types.includes(selectedType as ResponderType)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">First Responder Toolkit</h1>
                <p className="text-sm text-gray-400">Tools for those who protect us</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="tel:911"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Phone className="w-4 h-4" />
                Emergency: 911
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Supporting Those Who Serve Our Communities
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Free tools and resources for fire, EMS, law enforcement, and dispatch professionals.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {quickStats.map((stat, i) => (
              <div key={i} className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Service Type Selector */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {responderTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition ${
                selectedType === type.id 
                  ? `${type.color} text-white` 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <type.icon className="w-5 h-5" />
              {type.label}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTools.map(tool => (
            <a
              key={tool.id}
              href={tool.action}
              className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
                  <tool.icon className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white group-hover:text-red-400 transition">
                      {tool.title}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition" />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{tool.description}</p>
                  <div className="flex gap-1 mt-3">
                    {tool.types.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white/10 text-gray-400 text-xs rounded">
                        {t.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Quick Resources */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Quick Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="#" className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
              <Download className="w-6 h-6 text-red-400 mb-2" />
              <div className="font-semibold text-white">ICS Forms</div>
              <div className="text-sm text-gray-400">Download standard ICS forms</div>
            </a>
            <a href="#" className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mb-2" />
              <div className="font-semibold text-white">Hazmat Guides</div>
              <div className="text-sm text-gray-400">ERG and chemical references</div>
            </a>
            <a href="#" className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
              <MapPin className="w-6 h-6 text-green-400 mb-2" />
              <div className="font-semibold text-white">Pre-Plans</div>
              <div className="text-sm text-gray-400">Building pre-plan templates</div>
            </a>
            <a href="#" className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
              <Heart className="w-6 h-6 text-pink-400 mb-2" />
              <div className="font-semibold text-white">Wellness Resources</div>
              <div className="text-sm text-gray-400">Mental health and peer support</div>
            </a>
          </div>
        </div>

        {/* Mental Health Section */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400" />
            First Responder Wellness
          </h3>
          <p className="text-gray-300 mb-6">
            The job takes a toll. You deserve support. These resources are confidential.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-blue-400 font-semibold">Safe Call Now</div>
              <div className="text-2xl text-white font-bold">1-206-459-3020</div>
              <div className="text-gray-400 text-sm">24/7 crisis line for first responders</div>
            </div>
            <div>
              <div className="text-blue-400 font-semibold">Code Green Campaign</div>
              <a href="https://codegreencampaign.org" target="_blank" rel="noopener noreferrer" className="text-xl text-white hover:text-blue-300 font-bold">
                codegreencampaign.org
              </a>
              <div className="text-gray-400 text-sm">Mental health advocacy</div>
            </div>
            <div>
              <div className="text-blue-400 font-semibold">First Responder Support Network</div>
              <a href="https://frsn.org" target="_blank" rel="noopener noreferrer" className="text-xl text-white hover:text-blue-300 font-bold">
                frsn.org
              </a>
              <div className="text-gray-400 text-sm">Treatment programs</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>This toolkit is provided by CR AudioViz AI as part of our Social Impact Initiative.</p>
          <p className="mt-2">Dedicated to those who run toward danger when others run away.</p>
        </div>
      </div>
    </div>
  );
}
