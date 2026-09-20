import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, FileText, FolderOpen, Save, RefreshCw, 
  Plus, Check, Clock, Trash2, Download, Upload 
} from 'lucide-react';
import ModuleContainer from '../components/ModuleContainer';
import ExcelSpreadsheetEditor from '../components/ExcelSpreadsheetEditor';
import WordDocumentEditor from '../components/WordDocumentEditor';

// Sample templates
const TEMPLATES = {
  excel: [
    {
      id: 'tkb',
      title: 'Thời khoá biểu 2 buổi',
      sheets: {
        "Sang": [
          ["Tiết", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"],
          ["Tiết 1", "Chào cờ", "Toán", "Văn", "Tiếng Anh", "Lịch sử", "Toán"],
          ["Tiết 2", "Sinh hoạt", "Toán", "Văn", "Tiếng Anh", "Địa lý", "Vật lý"],
          ["Tiết 3", "Văn", "Vật lý", "Hoá học", "Tin học", "GDCD", "Hoá học"],
          ["Tiết 4", "Toán", "Hoá học", "Sinh học", "Thể dục", "Công nghệ", "Tiếng Anh"],
          ["Tiết 5", "Tiếng Anh", "Sinh học", "Lịch sử", "Thể dục", "Quốc phòng", "Sinh hoạt lớp"]
        ],
        "Chieu": [
          ["Tiết chiều", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
          ["Tiết 1", "Bồi dưỡng Toán", "Phụ đạo Văn", "Bồi dưỡng Anh", "Ôn tập KHTN", "-"],
          ["Tiết 2", "Bồi dưỡng Toán", "Phụ đạo Văn", "Bồi dưỡng Anh", "Ôn tập KHXH", "-"],
          ["Tiết 3", "Hoạt động trải nghiệm", "Thể thao / CLB", "-", "-", "-"]
        ]
      }
    },
    {
      id: 'diem',
      title: 'Bảng điểm & Xếp loại học tập',
      sheets: {
        "BangDiem": [
          ["STT", "Họ và Tên", "Điểm Toán", "Điểm Văn", "Điểm Anh", "Điểm TB", "Xếp Loại"],
          ["1", "Nguyễn Văn An", 8.5, 7.5, 9.0, "=AVERAGE(C2:E2)", "Giỏi"],
          ["2", "Trần Thị Bích", 7.0, 8.0, 7.5, "=AVERAGE(C3:E3)", "Khá"],
          ["3", "Lê Hoàng Cường", 9.0, 9.5, 8.5, "=AVERAGE(C4:E4)", "Xuất sắc"],
          ["4", "Phạm Minh Đức", 6.0, 6.5, 7.0, "=AVERAGE(C5:E5)", "Đạt"],
          ["Tổng cộng", "=COUNT(B2:B5) em", "=SUM(C2:C5)", "=SUM(D2:D5)", "=SUM(E2:E5)", "", ""]
        ]
      }
    }
  ],
  word: [
    {
      id: 'kehoach',
      title: 'Kế hoạch công tác & Bàn giao',
      html: null // Use default rich template
    },
    {
      id: 'bienban_phhs',
      title: 'Biên bản Họp phụ huynh đầu năm',
      html: `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 18px; font-weight: bold; text-transform: uppercase;">BIÊN BẢN HỌP PHỤ HUYNH ĐẦU NĂM HỌC 2026 - 2027</h2>
          <p style="font-style: italic; color: #64748b;">Thời gian: 08h00 ngày 20 tháng 09 năm 2026 tại phòng học lớp</p>
        </div>
        <h3>I. THÀNH PHẦN THAM DỰ</h3>
        <p>- Giáo viên chủ nhiệm: Cùng toàn thể Ban đại diện Cha mẹ học sinh lớp.</p>
        <p>- Tổng số phụ huynh tham dự: 42/42 (Đạt 100%).</p>
        <h3>II. NỘI DUNG CUỘC HỌP</h3>
        <p>1. GVCN báo cáo tình hình chuẩn bị năm học mới và nội quy trường THPT Phù Cừ.</p>
        <p>2. Thống nhất phương hướng học tập, rèn luyện nề nếp theo Thông tư 22/2021/TT-BGDĐT.</p>
        <p>3. Bầu Ban đại diện Hội cha mẹ học sinh lớp nhiệm kỳ 2026 - 2027.</p>
        <h3>III. KẾT LUẬN & CHỮ KÝ</h3>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead><tr style="background-color: #f1f5f9;"><th style="padding: 8px;">Đại diện PHHS</th><th style="padding: 8px;">Thư ký cuộc họp</th><th style="padding: 8px;">Giáo viên chủ nhiệm</th></tr></thead>
          <tbody><tr><td style="padding: 30px 8px; text-align: center;">(Ký tên)</td><td style="padding: 30px 8px; text-align: center;">(Ký tên)</td><td style="padding: 30px 8px; text-align: center;">(Ký và ghi rõ họ tên)</td></tr></tbody>
        </table>
      `
    }
  ]
};

export default function FileWorkspaceModule({ maLop = '10A1', classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [fileMode, setFileMode] = useState('excel'); // 'excel' | 'word'
  const [savedFiles, setSavedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('tkb');
  const [editorKey, setEditorKey] = useState(0);

  // Fetch saved documents from backend
  const fetchSavedDocuments = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`/api/documents?ma_lop=${encodeURIComponent(currentLop)}`);
      if (res.ok) {
        const data = await res.json();
        setSavedFiles(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Lỗi tải danh sách tệp lưu trữ:", e);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchSavedDocuments();
  }, [currentLop]);

  const handleDeleteSavedDoc = async (id, name) => {
    if (!window.confirm(`Xác nhận xóa tệp lưu trữ "${name}"?`)) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSavedDocuments();
      }
    } catch (e) {
      alert("Lỗi khi xóa tệp: " + e.message);
    }
  };

  return (
    <ModuleContainer
      title="SOẠN THẢO & QUẢN LÝ TỆP (WORD & EXCEL TRỰC TUYẾN)"
      desc={`Chỉnh sửa trực tiếp trên trình duyệt • Tải lên / Xuất file (.xlsx, .docx) • Đồng bộ lưu trữ lớp ${currentLop}`}
    >
      <div className="space-y-6">
        {/* FORMAT TOGGLE & TEMPLATE SELECTOR */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-md">
          {/* Format Tabs: Excel vs Word */}
          <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                setFileMode('excel');
                setActiveTemplate('tkb');
                setEditorKey(k => k + 1);
              }}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                fileMode === 'excel'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Bảng tính Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => {
                setFileMode('word');
                setActiveTemplate('kehoach');
                setEditorKey(k => k + 1);
              }}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                fileMode === 'word'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Văn bản Word (.docx)</span>
            </button>
          </div>

          {/* Preset Templates */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold">Mẫu sẵn có:</span>
            {TEMPLATES[fileMode].map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  setActiveTemplate(tpl.id);
                  setEditorKey(k => k + 1);
                }}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  activeTemplate === tpl.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE IN-BROWSER INTERACTIVE EDITOR */}
        <div className="rounded-2xl">
          {fileMode === 'excel' ? (
            <ExcelSpreadsheetEditor
              key={`excel-${editorKey}-${currentLop}`}
              initialSheets={TEMPLATES.excel.find(t => t.id === activeTemplate)?.sheets}
              defaultFileName={`Bang_Tinh_${currentLop}_${activeTemplate}`}
              maLop={currentLop}
              onSaveToBackend={() => fetchSavedDocuments()}
              title={`BẢNG TÍNH EXCEL - LỚP ${currentLop}`}
            />
          ) : (
            <WordDocumentEditor
              key={`word-${editorKey}-${currentLop}`}
              initialHtml={TEMPLATES.word.find(t => t.id === activeTemplate)?.html}
              defaultFileName={`Van_Ban_${currentLop}_${activeTemplate}`}
              maLop={currentLop}
              onSaveToBackend={() => fetchSavedDocuments()}
              title={`SOẠN THẢO VĂN BẢN WORD - LỚP ${currentLop}`}
            />
          )}
        </div>

        {/* LIST OF SAVED DOCUMENTS IN DATABASE */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>Tệp đã lưu trên máy chủ cho lớp {currentLop} ({savedFiles.length} tệp)</span>
            </h3>
            <button
              onClick={fetchSavedDocuments}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              title="Làm mới danh sách tệp"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {savedFiles.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Chưa có tệp nào được lưu cho lớp {currentLop}. Hãy nhấn nút "Lưu thay đổi" sau khi chỉnh sửa để lưu trữ vào cơ sở dữ liệu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedFiles.map((file) => {
                const isXlsx = file.file_type === 'excel' || file.file_name.endsWith('.xlsx');
                return (
                  <div
                    key={file.id}
                    className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl flex items-center justify-between hover:border-slate-700 transition shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {isXlsx ? (
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-white truncate" title={file.file_name}>
                          {file.file_name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(file.updated_at).toLocaleTimeString('vi-VN')} {new Date(file.updated_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => handleDeleteSavedDoc(file.id, file.file_name)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded transition"
                        title="Xóa tệp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ModuleContainer>
  );
}
