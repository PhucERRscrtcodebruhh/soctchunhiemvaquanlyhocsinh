import React, { useState, useEffect } from 'react';
import { Save, Upload, Download, Edit3, CheckCircle, RefreshCw, AlertCircle, FileSpreadsheet, FileText } from 'lucide-react';

export default function DocumentActionBar({
  title = "Tài liệu",
  fileType = "excel", // 'excel' | 'word'
  isDirty = false,
  isSaving = false,
  lastSavedTime = null,
  isEditing = true,
  onToggleEdit,
  onSave,
  onImportFile,
  onExportFile,
  toastMessage = null,
  acceptTypes = ".xlsx, .xls",
  fileName = "",
  extraControls = null
}) {
  const [toast, setToast] = useState(toastMessage);

  useEffect(() => {
    if (toastMessage) {
      setToast(toastMessage);
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const isExcel = fileType === 'excel';

  return (
    <div className="relative">
      {/* Top Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-2xl animate-in fade-in slide-in-from-top duration-300 border border-emerald-400/30">
          <CheckCircle className="w-4 h-4 text-white shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/70 dark:bg-slate-950/80 bg-slate-900 border border-slate-800 rounded-2xl shadow-md backdrop-blur-sm">
        {/* Left: Document Info & Status Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {isExcel ? (
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileText className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                {fileName && (
                  <span className="text-[11px] font-mono font-normal text-cyan-400">
                    ({fileName})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Indicator Badges */}
          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Đang lưu...</span>
              </span>
            ) : isDirty ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Chưa lưu thay đổi</span>
              </span>
            ) : lastSavedTime ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-3 h-3" />
                <span>Đã lưu {lastSavedTime}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-slate-500">
                Sẵn sàng chỉnh sửa
              </span>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {extraControls}

          {/* 1. Toggle Chỉnh Sửa Button */}
          {onToggleEdit && (
            <button
              onClick={onToggleEdit}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                isEditing
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title={isEditing ? "Đang bật chế độ chỉnh sửa" : "Bật chế độ chỉnh sửa"}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Chỉnh sửa: BẬT" : "Chỉnh Sửa"}</span>
            </button>
          )}

          {/* 2. Tải Lên / Nhập File Button */}
          {onImportFile && (
            <label className="cursor-pointer px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isExcel ? "Nhập Excel (.xlsx)" : "Nhập Word (.docx)"}</span>
              <input
                type="file"
                accept={acceptTypes}
                onChange={onImportFile}
                className="hidden"
              />
            </label>
          )}

          {/* 3. Xuất Tệp / Tải Về Button */}
          {onExportFile && (
            <button
              onClick={onExportFile}
              type="button"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition"
              title="Xuất tải về phiên bản mới nhất đã chỉnh sửa"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isExcel ? "Xuất Excel" : "Xuất Word"}</span>
            </button>
          )}

          {/* 4. PRIMARY: Lưu Thay Đổi Button */}
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              type="button"
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                isDirty
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 ring-2 ring-cyan-400/40 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
              }`}
              title="Lưu tất cả thay đổi hiện tại vào hệ thống"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
