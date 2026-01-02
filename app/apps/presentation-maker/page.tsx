'use client';

import { useState } from 'react';
import { Presentation, Plus, Download, Sparkles, Play, Image, Type, Layout, Palette, ChevronLeft, ChevronRight, Trash2, Copy, Move } from 'lucide-react';

interface Slide {
  id: string;
  layout: 'title' | 'content' | 'two-column' | 'image' | 'blank';
  title: string;
  content: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
}

const layoutOptions = [
  { id: 'title', label: 'Title Slide', icon: Type },
  { id: 'content', label: 'Content', icon: Layout },
  { id: 'two-column', label: 'Two Column', icon: Layout },
  { id: 'image', label: 'Image Focus', icon: Image },
  { id: 'blank', label: 'Blank', icon: Layout }
];

const themes = [
  { name: 'Professional', bg: '#1e293b', text: '#ffffff', accent: '#3b82f6' },
  { name: 'Modern', bg: '#18181b', text: '#ffffff', accent: '#8b5cf6' },
  { name: 'Clean', bg: '#ffffff', text: '#1f2937', accent: '#059669' },
  { name: 'Bold', bg: '#dc2626', text: '#ffffff', accent: '#fbbf24' },
  { name: 'Minimal', bg: '#f8fafc', text: '#0f172a', accent: '#64748b' }
];

export default function PresentationMakerPage() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      layout: 'title',
      title: 'Your Presentation Title',
      content: 'Subtitle or tagline goes here',
      backgroundColor: '#1e293b',
      textColor: '#ffffff'
    }
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);

  const addSlide = (layout: Slide['layout'] = 'content') => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      layout,
      title: 'New Slide',
      content: 'Add your content here',
      backgroundColor: selectedTheme.bg,
      textColor: selectedTheme.text
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const updateSlide = (field: keyof Slide, value: string) => {
    const updated = [...slides];
    updated[currentSlide] = { ...updated[currentSlide], [field]: value };
    setSlides(updated);
  };

  const deleteSlide = (index: number) => {
    if (slides.length === 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    if (currentSlide >= updated.length) {
      setCurrentSlide(updated.length - 1);
    }
  };

  const duplicateSlide = (index: number) => {
    const duplicate = { ...slides[index], id: Date.now().toString() };
    const updated = [...slides];
    updated.splice(index + 1, 0, duplicate);
    setSlides(updated);
  };

  const applyTheme = (theme: typeof themes[0]) => {
    setSelectedTheme(theme);
    const updated = slides.map(slide => ({
      ...slide,
      backgroundColor: theme.bg,
      textColor: theme.text
    }));
    setSlides(updated);
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const currentSlideData = slides[currentSlide];

  const renderSlide = (slide: Slide, isPreview = false) => {
    const scale = isPreview ? 'scale-100' : 'scale-50';
    
    return (
      <div
        className={`w-full aspect-video rounded-xl overflow-hidden flex flex-col ${isPreview ? '' : 'cursor-pointer hover:ring-2 hover:ring-purple-500'}`}
        style={{ backgroundColor: slide.backgroundColor, color: slide.textColor }}
      >
        {slide.layout === 'title' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h1 className={`font-bold ${isPreview ? 'text-4xl md:text-6xl' : 'text-lg'} mb-4`}>{slide.title}</h1>
            <p className={`opacity-80 ${isPreview ? 'text-xl md:text-2xl' : 'text-xs'}`}>{slide.content}</p>
          </div>
        )}
        {slide.layout === 'content' && (
          <div className="flex-1 flex flex-col p-8">
            <h2 className={`font-bold ${isPreview ? 'text-3xl md:text-4xl' : 'text-sm'} mb-6`}>{slide.title}</h2>
            <p className={`flex-1 ${isPreview ? 'text-lg md:text-xl' : 'text-xs'} whitespace-pre-wrap`}>{slide.content}</p>
          </div>
        )}
        {slide.layout === 'two-column' && (
          <div className="flex-1 flex flex-col p-8">
            <h2 className={`font-bold ${isPreview ? 'text-3xl' : 'text-sm'} mb-6`}>{slide.title}</h2>
            <div className="flex-1 grid grid-cols-2 gap-8">
              <div className={`${isPreview ? 'text-lg' : 'text-xs'}`}>{slide.content}</div>
              <div className={`${isPreview ? 'text-lg' : 'text-xs'} opacity-70`}>Column 2 content</div>
            </div>
          </div>
        )}
        {slide.layout === 'image' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-black/20 flex items-center justify-center">
              {slide.imageUrl ? (
                <img src={slide.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
              ) : (
                <Image className={`${isPreview ? 'w-24 h-24' : 'w-8 h-8'} opacity-30`} />
              )}
            </div>
            <div className="p-4 text-center">
              <p className={`${isPreview ? 'text-lg' : 'text-xs'}`}>{slide.title}</p>
            </div>
          </div>
        )}
        {slide.layout === 'blank' && (
          <div className="flex-1 p-8">
            <p className={`${isPreview ? 'text-lg' : 'text-xs'}`}>{slide.content}</p>
          </div>
        )}
      </div>
    );
  };

  if (isPresentMode) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: currentSlideData.backgroundColor }}
        onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setIsPresentMode(false); }}
          className="absolute top-4 right-4 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70"
        >
          Exit (ESC)
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.max(prev - 1, 0)); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full hover:bg-black/50"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1)); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full hover:bg-black/50"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <div className="w-full max-w-6xl aspect-video">
          {renderSlide(currentSlideData, true)}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Presentation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Presentation Maker</h1>
                <p className="text-sm text-gray-400">Create stunning slides with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </button>
              <button
                onClick={() => setIsPresentMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                <Play className="w-4 h-4" />
                Present
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Slide Thumbnails */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Slides</span>
              <button
                onClick={() => addSlide()}
                className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`relative group ${currentSlide === index ? 'ring-2 ring-purple-500' : ''}`}
                >
                  <div className="text-xs text-gray-500 mb-1">{index + 1}</div>
                  {renderSlide(slide)}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }}
                      className="p-1 bg-black/50 text-white rounded text-xs"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
                      className="p-1 bg-red-600/50 text-white rounded text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Editor */}
          <div className="col-span-7">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              {/* Preview */}
              <div className="mb-6">
                {renderSlide(currentSlideData, true)}
              </div>

              {/* Editor Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={currentSlideData.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Content</label>
                  <textarea
                    value={currentSlideData.content}
                    onChange={(e) => updateSlide('content', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-3 space-y-6">
            {/* Layout Options */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Layout
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {layoutOptions.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => updateSlide('layout', layout.id)}
                    className={`p-2 rounded-lg text-center transition ${
                      currentSlideData.layout === layout.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <layout.icon className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs">{layout.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Themes
              </h3>
              <div className="space-y-2">
                {themes.map(theme => (
                  <button
                    key={theme.name}
                    onClick={() => applyTheme(theme)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition ${
                      selectedTheme.name === theme.name
                        ? 'ring-2 ring-purple-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg border border-white/20"
                      style={{ backgroundColor: theme.bg }}
                    />
                    <span className="text-sm text-gray-300">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Slide */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Add Slide</h3>
              <div className="grid grid-cols-2 gap-2">
                {layoutOptions.slice(0, 4).map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => addSlide(layout.id as Slide['layout'])}
                    className="p-3 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition text-center"
                  >
                    <layout.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{layout.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
