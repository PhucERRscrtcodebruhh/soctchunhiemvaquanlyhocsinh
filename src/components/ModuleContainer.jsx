import React from 'react';

export default function ModuleContainer({ title, desc, children }) {
  return (
    <div className="max-w-6xl space-y-4 pt-12 md:pt-0">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <h2 className="text-sm font-bold text-white tracking-tight uppercase">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {children}
      </div>
    </div>
  );
}