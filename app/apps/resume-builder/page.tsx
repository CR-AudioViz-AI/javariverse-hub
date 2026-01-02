'use client';

import { useState } from 'react';
import { FileText, Download, Sparkles, Briefcase, GraduationCap, Award, User, Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa: string;
  }>;
  skills: string[];
}

export default function ResumeBuilderPage() {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills'>('personal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: []
  });
  const [newSkill, setNewSkill] = useState('');

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        degree: '',
        school: '',
        location: '',
        graduationDate: '',
        gpa: ''
      }]
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Resume Builder</h1>
                <p className="text-sm text-gray-400">AI-Powered Professional Resumes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'AI Enhance'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'edit' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            Edit Resume
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'preview' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            Preview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-4">Sections</h3>
              <div className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as typeof activeSection)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeSection === section.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Form/Preview */}
          <div className="lg:col-span-2">
            {activeTab === 'edit' ? (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                {activeSection === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            value={resumeData.personalInfo.fullName}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                            }))}
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="email"
                            value={resumeData.personalInfo.email}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value }
                            }))}
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="tel"
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, phone: e.target.value }
                            }))}
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            value={resumeData.personalInfo.location}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value }
                            }))}
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="New York, NY"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">LinkedIn</label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="url"
                            value={resumeData.personalInfo.linkedin}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                            }))}
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="linkedin.com/in/johndoe"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Website</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="url"
                            value={resumeData.personalInfo.website}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, website: e.target.value }
                            }))}
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="johndoe.com"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Professional Summary</label>
                      <textarea
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, summary: e.target.value }
                        }))}
                        rows={4}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="A brief summary of your professional background and career objectives..."
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Work Experience</h3>
                      <button
                        onClick={addExperience}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        + Add Experience
                      </button>
                    </div>
                    {resumeData.experience.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No experience added yet</p>
                        <p className="text-sm">Click "Add Experience" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {resumeData.experience.map((exp, index) => (
                          <div key={exp.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={exp.title}
                                onChange={(e) => {
                                  const newExp = [...resumeData.experience];
                                  newExp[index].title = e.target.value;
                                  setResumeData(prev => ({ ...prev, experience: newExp }));
                                }}
                                placeholder="Job Title"
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => {
                                  const newExp = [...resumeData.experience];
                                  newExp[index].company = e.target.value;
                                  setResumeData(prev => ({ ...prev, experience: newExp }));
                                }}
                                placeholder="Company Name"
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <textarea
                              value={exp.description}
                              onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[index].description = e.target.value;
                                setResumeData(prev => ({ ...prev, experience: newExp }));
                              }}
                              placeholder="Describe your responsibilities and achievements..."
                              rows={3}
                              className="w-full mt-4 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Education</h3>
                      <button
                        onClick={addEducation}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        + Add Education
                      </button>
                    </div>
                    {resumeData.education.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No education added yet</p>
                        <p className="text-sm">Click "Add Education" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {resumeData.education.map((edu, index) => (
                          <div key={edu.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => {
                                  const newEdu = [...resumeData.education];
                                  newEdu[index].degree = e.target.value;
                                  setResumeData(prev => ({ ...prev, education: newEdu }));
                                }}
                                placeholder="Degree"
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => {
                                  const newEdu = [...resumeData.education];
                                  newEdu[index].school = e.target.value;
                                  setResumeData(prev => ({ ...prev, education: newEdu }));
                                }}
                                placeholder="School Name"
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="Add a skill..."
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={addSkill}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {resumeData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(index)}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Preview Mode */
              <div className="bg-white rounded-2xl p-8 text-gray-900">
                <div className="text-center border-b pb-6 mb-6">
                  <h1 className="text-3xl font-bold">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
                    {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                  </div>
                </div>
                {resumeData.personalInfo.summary && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
                    <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
                  </div>
                )}
                {resumeData.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Experience</h2>
                    {resumeData.experience.map(exp => (
                      <div key={exp.id} className="mb-4">
                        <div className="font-semibold">{exp.title || 'Job Title'}</div>
                        <div className="text-gray-600">{exp.company || 'Company'}</div>
                        <p className="text-sm mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {resumeData.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
