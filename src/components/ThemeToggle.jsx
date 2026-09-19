import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggleTheme, className = '' }) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggleTheme}
      type="button"
      title={isDark ? "Chuyển sang Giao diện Sáng (Light Mode)" : "Chuyển sang Giao diện Tối (Dark Mode)"}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-300 shadow-sm select-none ${
        isDark 
          ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300' 
          : 'bg-white hover:bg-slate-100 border-slate-300 text-cyan-600 hover:text-cyan-500 shadow-slate-200'
      } ${className}`}
      aria-label="Theme toggle"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 scale-100 animate-in fade-in" />
        ) : (
          <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 scale-100 animate-in fade-in" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
