'use client';

import { useState, useRef } from 'react';
import { Image, Download, RotateCcw, Sun, Contrast, Droplets, Palette, Crop, FlipHorizontal, FlipVertical, RotateCw, Sparkles, Upload, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

export default function PhotoEditorPage() {
  const [image, setImage] = useState<string | null>(null);
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0
  });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0
    });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(100);
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'vivid':
        setFilters({ ...filters, saturation: 150, contrast: 120, brightness: 105 });
        break;
      case 'vintage':
        setFilters({ ...filters, sepia: 40, saturation: 80, contrast: 90 });
        break;
      case 'bw':
        setFilters({ ...filters, grayscale: 100, contrast: 120 });
        break;
      case 'warm':
        setFilters({ ...filters, sepia: 20, saturation: 110, hueRotate: -10 });
        break;
      case 'cool':
        setFilters({ ...filters, saturation: 90, hueRotate: 20, brightness: 105 });
        break;
      case 'dramatic':
        setFilters({ ...filters, contrast: 150, saturation: 120, brightness: 90 });
        break;
    }
  };

  const enhanceWithAI = async () => {
    setIsEnhancing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setFilters({
      ...filters,
      brightness: 105,
      contrast: 115,
      saturation: 110
    });
    setIsEnhancing(false);
  };

  const getFilterStyle = () => {
    return {
      filter: `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        blur(${filters.blur}px)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        hue-rotate(${filters.hueRotate}deg)
      `,
      transform: `
        rotate(${rotation}deg)
        scaleX(${flipH ? -1 : 1})
        scaleY(${flipV ? -1 : 1})
        scale(${zoom / 100})
      `
    };
  };

  const presets = [
    { id: 'vivid', label: 'Vivid', color: 'from-pink-500 to-orange-500' },
    { id: 'vintage', label: 'Vintage', color: 'from-amber-600 to-yellow-500' },
    { id: 'bw', label: 'B&W', color: 'from-gray-600 to-gray-400' },
    { id: 'warm', label: 'Warm', color: 'from-orange-500 to-red-500' },
    { id: 'cool', label: 'Cool', color: 'from-blue-500 to-cyan-500' },
    { id: 'dramatic', label: 'Dramatic', color: 'from-purple-600 to-indigo-600' }
  ];

  const filterControls = [
    { key: 'brightness', label: 'Brightness', icon: Sun, min: 0, max: 200 },
    { key: 'contrast', label: 'Contrast', icon: Contrast, min: 0, max: 200 },
    { key: 'saturation', label: 'Saturation', icon: Droplets, min: 0, max: 200 },
    { key: 'blur', label: 'Blur', icon: Image, min: 0, max: 20 },
    { key: 'grayscale', label: 'Grayscale', icon: Palette, min: 0, max: 100 },
    { key: 'sepia', label: 'Sepia', icon: Palette, min: 0, max: 100 },
    { key: 'hueRotate', label: 'Hue', icon: Palette, min: -180, max: 180 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Photo Editor</h1>
                <p className="text-sm text-gray-400">Edit and enhance your images</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={enhanceWithAI}
                disabled={!image || isEnhancing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                disabled={!image}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Canvas */}
          <div className="col-span-8">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 min-h-[600px] flex items-center justify-center">
              {image ? (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt="Editing"
                    style={getFilterStyle()}
                    className="max-w-full max-h-[500px] transition-all duration-200"
                  />
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="text-center cursor-pointer p-12 border-2 border-dashed border-white/20 rounded-2xl hover:border-pink-500/50 transition"
                >
                  <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Click to upload an image</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Transform Controls */}
            {image && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => setRotation(r => r - 90)}
                  className="p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  title="Rotate Left"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setRotation(r => r + 90)}
                  className="p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  title="Rotate Right"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setFlipH(f => !f)}
                  className={`p-3 rounded-lg transition ${flipH ? 'bg-pink-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setFlipV(f => !f)}
                  className={`p-3 rounded-lg transition ${flipV ? 'bg-pink-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setZoom(z => Math.max(50, z - 10))}
                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-white text-sm w-12 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(z => Math.min(200, z + 10))}
                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="col-span-4 space-y-6">
            {/* Presets */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Presets</h3>
              <div className="grid grid-cols-3 gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-3 rounded-xl bg-gradient-to-br ${preset.color} text-white text-xs font-medium hover:opacity-80 transition`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustments */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-4">Adjustments</h3>
              <div className="space-y-4">
                {filterControls.map(control => (
                  <div key={control.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <control.icon className="w-4 h-4" />
                        {control.label}
                      </div>
                      <span className="text-xs text-gray-500">
                        {filters[control.key as keyof ImageFilters]}
                        {control.key === 'hueRotate' ? '°' : control.key === 'blur' ? 'px' : '%'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      value={filters[control.key as keyof ImageFilters]}
                      onChange={(e) => setFilters(f => ({ ...f, [control.key]: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Upload New */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload New Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
