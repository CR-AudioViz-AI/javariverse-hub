// app/admin/grants/[id]/components/GrantActions.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Archive, Trash2, Copy, Download, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function GrantActions({ grant }: { grant: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this grant?')) return;
    try {
      await fetch(`/api/admin/grants/${grant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Error archiving grant:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <Link href={`/admin/grants/${grant.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Edit className="w-4 h-4" />
            Edit Grant
          </Link>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Share2 className="w-4 h-4" />
            Copy Link
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Download className="w-4 h-4" />
            Export
          </button>
          <hr className="my-1" />
          <button
            onClick={handleArchive}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50">
            <Archive className="w-4 h-4" />
            Archive
          </button>
        </div>
      )}
    </div>
  );
}
