// app/admin/grants/calendar/GrantCalendarView.tsx
// Interactive Calendar Component
// Timestamp: Saturday, December 13, 2025 - 12:35 PM EST

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  type: 'deadline' | 'milestone' | 'report' | 'followup' | 'decision';
  title: string;
  subtitle: string;
  date: string;
  grantId: string;
  priority?: string;
  color: string;
}

const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  green: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
};

export default function GrantCalendarView({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Generate calendar days
  const days: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-28 border-b border-r border-gray-100 bg-gray-50"></div>;
          }

          const dayEvents = getEventsForDate(date);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <div
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`h-28 border-b border-r border-gray-100 p-1 cursor-pointer transition-colors ${
                today ? 'bg-blue-50' : selected ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                today ? 'text-blue-600' : 'text-gray-900'
              }`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  today ? 'bg-blue-600 text-white' : ''
                }`}>
                  {date.getDate()}
                </span>
              </div>
              <div className="space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const colors = EVENT_COLORS[event.color] || EVENT_COLORS.blue;
                  return (
                    <div
                      key={event.id}
                      className={`px-1.5 py-0.5 rounded text-xs truncate ${colors.bg} ${colors.text}`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </h3>
          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events on this date</p>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => {
                const colors = EVENT_COLORS[event.color] || EVENT_COLORS.blue;
                return (
                  <Link
                    key={event.id}
                    href={`/admin/grants/${event.grantId}`}
                    className={`block p-3 rounded-lg ${colors.bg} hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                      <span className={`text-sm font-medium ${colors.text}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">{event.title}</p>
                    {event.subtitle && (
                      <p className="text-xs text-gray-600">{event.subtitle}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
