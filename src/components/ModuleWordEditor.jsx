import React, { useState, useEffect } from 'react';
import { FileText, Printer, Eye, Edit3, RefreshCw } from 'lucide-react';
import WordDocumentEditor from './WordDocumentEditor';

const MODULE_KEY_MAP = {
  soyeulylich: 'so_yeu_ly_lich',
  phuhuynh: 'ban_dai_dien_cha_me',
  canbo: 'can_bo_lop_doan',
  sodo: 'so_do_lop_hoc',
  tkb: 'thoi_khoa_bieu',
  theodoi: 'theo_doi_hoc_tap',
  cabiet: 'giao_duc_ca_biet',
  sinhhoat: 'sinh_hoat_lop',
  tt22: 'thong_tu_22',
  thidua: 'thi_dua_lop',
  bangiao: 'bien_ban_ban_giao',
  bgh: 'kiem_tra_bgh'
};

export default function ModuleWordEditor({
  moduleId,
  moduleKey = null,
  moduleTitle,
  moduleDesc,
  maLop = '10A1',
  defaultHtml = '',
  exportFileName = '',
  children = null, // Optional alternative/raw table view
  rawTableTitle = 'Dữ liệu thô'
}) {
  const effectiveKey = moduleKey || MODULE_KEY_MAP[moduleId] || moduleId;
  const [docHtml, setDocHtml] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('word'); // 'word' | 'raw'
  const [editorKey, setEditorKey] = useState(0);

  // Load saved document for this module and class from MySQL
  const loadModuleDocument = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/modules/load?class_id=${encodeURIComponent(maLop)}&module_key=${encodeURIComponent(effectiveKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.content_json) {
          setDocHtml(data.content_json);
        } else {
          setDocHtml(defaultHtml);
        }
      } else {
        setDocHtml(defaultHtml);
      }
    } catch (err) {
      console.warn(`Lỗi tải văn bản ${effectiveKey}:`, err);
      setDocHtml(defaultHtml);
    } finally {
      setLoading(false);
      setEditorKey(k => k + 1);
    }
  };

  useEffect(() => {
    loadModuleDocument();
  }, [effectiveKey, maLop, defaultHtml]);

  // Handle Save from WordDocumentEditor to MySQL backend
  const handleSaveToBackend = async ({ html, fileName, docxBase64 }) => {
    try {
      const res = await fetch('/api/modules/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: maLop,
          module_key: effectiveKey,
          doc_type: 'WORD',
          file_name: `${fileName || effectiveKey}.docx`,
          content_json: html,
          file_blob_base64: docxBase64 || null
        })
      });
      if (res.ok) {
        setDocHtml(html);
      }
    } catch (e) {
      console.error(`Lỗi lưu văn bản module ${effectiveKey}:`, e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Module Top Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>{moduleTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {moduleDesc || `Soạn thảo trực tiếp văn bản Word (.docx) • Đồng bộ MySQL lớp ${maLop}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Print / PDF button */}
          <button
            onClick={handlePrint}
            type="button"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            title="In hoặc lưu thành PDF (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>In / PDF</span>
          </button>

          {/* Toggle between Word Editor and Raw Table (if children exists) */}
          {children && (
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode('word')}
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'word'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Văn bản Word</span>
              </button>
              <button
                onClick={() => setViewMode('raw')}
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'raw'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{rawTableTitle}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'word' ? (
        loading ? (
          <div className="py-20 text-center text-slate-400 text-xs bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Đang nạp văn bản Word và dữ liệu từ MySQL...</span>
          </div>
        ) : (
          <div className="rounded-2xl">
            <WordDocumentEditor
              key={`doc-${effectiveKey}-${maLop}-${editorKey}`}
              initialHtml={docHtml || defaultHtml}
              defaultFileName={exportFileName || `Van_Ban_${effectiveKey}_${maLop}`}
              maLop={maLop}
              moduleKey={effectiveKey}
              title={moduleTitle}
              onSaveToBackend={handleSaveToBackend}
            />
          </div>
        )
      ) : (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}
