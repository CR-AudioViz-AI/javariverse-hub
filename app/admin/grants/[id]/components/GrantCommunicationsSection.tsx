// app/admin/grants/[id]/components/GrantCommunicationsSection.tsx
'use client';

import { useState } from 'react';
import { MessageSquare, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface Communication {
  id: string;
  communication_type: string;
  subject: string | null;
  summary: string;
  communication_date: string;
  followup_required: boolean;
  followup_date: string | null;
  followup_completed: boolean;
  grant_contacts?: { first_name: string; last_name: string } | null;
}

const COMM_TYPE_LABELS: Record<string, string> = {
  email_sent: 'Email Sent',
  email_received: 'Email Received',
  phone_call: 'Phone Call',
  video_call: 'Video Call',
  in_person_meeting: 'In-Person Meeting',
  letter_sent: 'Letter Sent',
  letter_received: 'Letter Received',
  webinar: 'Webinar',
  conference: 'Conference',
  site_visit: 'Site Visit',
  other: 'Other',
};

export default function GrantCommunicationsSection({ grantId, communications, contacts }: { grantId: string; communications: Communication[]; contacts: any[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">Communications</h2>
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{communications.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => e.stopPropagation()} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
            <Plus className="w-4 h-4" />Log
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {communications.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No communications logged</p>
            </div>
          ) : (
            communications.map((comm) => (
              <div key={comm.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm">
                    {comm.communication_type.includes('email') ? '✉️' : comm.communication_type === 'phone_call' ? '📞' : '💬'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {COMM_TYPE_LABELS[comm.communication_type] || comm.communication_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comm.communication_date).toLocaleDateString()}
                      </span>
                    </div>
                    {comm.subject && <p className="text-sm text-gray-700 font-medium">{comm.subject}</p>}
                    <p className="text-sm text-gray-600 mt-1">{comm.summary}</p>
                    {comm.followup_required && !comm.followup_completed && (
                      <div className="mt-2 px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-700">
                        Follow-up: {comm.followup_date ? new Date(comm.followup_date).toLocaleDateString() : 'TBD'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
