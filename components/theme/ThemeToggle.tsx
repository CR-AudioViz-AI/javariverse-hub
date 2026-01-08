'use client';

import React from 'react';
import { useTheme, ThemePreference } from './ThemeProvider';

function nextPref(p: ThemePreference): ThemePreference {
  if (p === 'system') return 'light';
  if (p === 'light') return 'dark';
  return 'system';
}

function label(p: ThemePreference) {
  if (p === 'system') return 'Sys';
  if (p === 'light') return 'Light';
  return 'Dark';
}

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setPreference(nextPref(preference))}
      className="
        h-9 w-20
        inline-flex items-center justify-center
        rounded-md border
        text-xs font-semibold
        transition-colors
        border-slate-300 text-slate-700 bg-white hover:bg-slate-50
        dark:border-slate-700 dark:text-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800
      "
    >
      {label(preference)}
    </button>
  );
}
