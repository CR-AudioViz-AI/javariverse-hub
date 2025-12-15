// app/admin/grants/[id]/components/GrantNotesSection.tsx
'use client';

import { useState } from 'react';
import { StickyNote, Plus, ChevronDown, ChevronUp, Pin } from 'lucide-react';

interface Note {
  id: string;
  note_type: string;
  title: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export default function GrantNotesSection({ grantId, notes }: { grantId: string; notes: Note[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-yellow-600" />
          <h2 className="font-semibold text-gray-900">Notes</h2>
          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">{notes.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => e.stopPropagation()} className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center gap-1">
            <Plus className="w-4 h-4" />Add
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 max-h-[300px] overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className={`p-3 rounded-lg ${note.is_pinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {note.title && <p className="font-medium text-gray-900 text-sm">{note.title}</p>}
                      <p className="text-sm text-gray-700">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                    </div>
                    {note.is_pinned && <Pin className="w-4 h-4 text-yellow-600" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
