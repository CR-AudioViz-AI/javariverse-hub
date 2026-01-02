'use client';

import { useState } from 'react';
import { FileInput, Plus, Trash2, GripVertical, Eye, Code, Download, Copy, Type, Mail, Phone, Hash, Calendar, CheckSquare, List, TextCursor, Sparkles } from 'lucide-react';

type FieldType = 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

const fieldTypes: { type: FieldType; label: string; icon: React.ElementType }[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'textarea', label: 'Long Text', icon: TextCursor },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio', icon: CheckSquare }
];

export default function FormBuilderPage() {
  const [formName, setFormName] = useState('Contact Form');
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
    { id: '2', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
    { id: '3', type: 'textarea', label: 'Message', placeholder: 'Your message...', required: false }
  ]);
  const [activeTab, setActiveTab] = useState<'build' | 'preview' | 'code'>('build');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const generateHTML = () => {
    let html = `<form class="space-y-4">\n`;
    fields.forEach(field => {
      html += `  <div class="form-group">\n`;
      html += `    <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>\n`;
      
      switch (field.type) {
        case 'textarea':
          html += `    <textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder}"${field.required ? ' required' : ''}></textarea>\n`;
          break;
        case 'select':
          html += `    <select id="${field.id}" name="${field.id}"${field.required ? ' required' : ''}>\n`;
          field.options?.forEach(opt => {
            html += `      <option value="${opt}">${opt}</option>\n`;
          });
          html += `    </select>\n`;
          break;
        case 'checkbox':
        case 'radio':
          field.options?.forEach((opt, i) => {
            html += `    <label><input type="${field.type}" name="${field.id}" value="${opt}"> ${opt}</label>\n`;
          });
          break;
        default:
          html += `    <input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder}"${field.required ? ' required' : ''}>\n`;
      }
      html += `  </div>\n`;
    });
    html += `  <button type="submit">Submit</button>\n`;
    html += `</form>`;
    return html;
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(generateHTML());
  };

  const selectedFieldData = fields.find(f => f.id === selectedField);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <FileInput className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Form Builder</h1>
                <p className="text-sm text-gray-400">Create custom forms easily</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
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
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('build')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'build' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <FileInput className="w-4 h-4" />
            Build
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'preview' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'code' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Field Types */}
          <div className="col-span-2">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Add Field</h3>
              <div className="space-y-2">
                {fieldTypes.map(ft => (
                  <button
                    key={ft.type}
                    onClick={() => addField(ft.type)}
                    className="w-full flex items-center gap-2 p-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition text-sm"
                  >
                    <ft.icon className="w-4 h-4" />
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="col-span-7">
            {activeTab === 'build' && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="text-xl font-bold text-white bg-transparent border-none focus:outline-none mb-6 w-full"
                />
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      onClick={() => setSelectedField(field.id)}
                      className={`p-4 bg-white/5 rounded-xl cursor-pointer transition ${selectedField === field.id ? 'ring-2 ring-cyan-500' : 'hover:bg-white/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{field.label}</span>
                            {field.required && <span className="text-red-400 text-xs">Required</span>}
                          </div>
                          <span className="text-sm text-gray-500 capitalize">{field.type}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                          className="p-1 text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileInput className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No fields yet. Add one from the left panel.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="bg-white rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{formName}</h2>
                <form className="space-y-4">
                  {fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          rows={4}
                        />
                      ) : field.type === 'select' ? (
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                          {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'checkbox' || field.type === 'radio' ? (
                        <div className="space-y-2">
                          {field.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-2">
                              <input type={field.type} name={field.id} />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
                  >
                    Submit
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <pre className="bg-black/50 rounded-xl p-4 overflow-auto max-h-[600px] text-sm text-gray-300">
                  <code>{generateHTML()}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Field Properties */}
          <div className="col-span-3">
            {selectedFieldData ? (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-white mb-4">Field Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={selectedFieldData.label}
                      onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Placeholder</label>
                    <input
                      type="text"
                      value={selectedFieldData.placeholder}
                      onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFieldData.required}
                      onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">Required field</span>
                  </label>
                  {(selectedFieldData.type === 'select' || selectedFieldData.type === 'radio') && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Options (one per line)</label>
                      <textarea
                        value={selectedFieldData.options?.join('\n') || ''}
                        onChange={(e) => updateField(selectedFieldData.id, { options: e.target.value.split('\n') })}
                        rows={4}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 text-center text-gray-500">
                <p className="text-sm">Select a field to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
