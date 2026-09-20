import React from 'react';
import { AlertTriangle, Save, LogOut, X } from 'lucide-react';

export default function UnsavedChangesModal({
  isOpen,
  onCancel,
  onDiscard,
  onSaveAndProceed,
  documentTitle = "tài liệu"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Bạn có thay đổi chưa lưu!</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Các sửa đổi trong <b className="text-cyan-400">{documentTitle}</b> chưa được lưu lại. 
              Nếu bạn rời khỏi trang này bây giờ, các thay đổi vừa chỉnh sửa sẽ bị mất.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onCancel}
            type="button"
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Ở lại chỉnh sửa
          </button>
          
          <button
            onClick={onDiscard}
            type="button"
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Rời đi không lưu</span>
          </button>

          <button
            onClick={onSaveAndProceed}
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu & Tiếp tục</span>
          </button>
        </div>
      </div>
    </div>
  );
}
