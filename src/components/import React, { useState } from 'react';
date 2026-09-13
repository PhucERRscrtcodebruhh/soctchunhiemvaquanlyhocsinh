import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, Trash2 } from 'lucide-react';

export default function ExcelTableManager({ 
  defaultColumns = [], 
  defaultRows = [], 
  exportFileName = "bang-du-lieu", 
  emptyNotice = "Chưa có dữ liệu bảng" 
}) {
  const [columns, setColumns] = useState(defaultColumns);
  const [rows, setRows] = useState(defaultRows);
  const [fileName, setFileName] = useState('');

  // Nhập file Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data && data.length > 0) {
        const headers = data[0].filter(h => h !== undefined && h !== null && h !== '');
        const contentRows = data.slice(1).filter(r => r && r.some(c => c !== undefined && c !== null && c !== ''));
        setColumns(headers);
        setRows(contentRows);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Xuất file Excel
  const handleExport = () => {
    if (columns.length === 0 && rows.length === 0) return;
    const worksheetData = [columns, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  const handleClear = () => {
    setColumns([]);
    setRows([]);
    setFileName('');
  };

  return (
    <div className="space-y-4">
      {/* Thanh nút công cụ dùng chung */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Excel</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExport}
            disabled={columns.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 disabled:text-slate-600 disabled:hover:bg-slate-800 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          {fileName && (
            <span className="text-[11px] text-cyan-400 font-mono">
              File: <b>{fileName}</b> ({rows.length} hàng)
            </span>
          )}
        </div>

        {columns.length > 0 && (
          <button
            onClick={handleClear}
            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-1 border border-red-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xoá</span>
          </button>
        )}
      </div>

      {/* Hiển thị bảng dữ liệu động */}
      {columns.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
          {emptyNotice}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-800/95 text-slate-400 uppercase text-[10px] sticky top-0 z-10">
              <tr>
                <th className="p-2.5 border-b border-slate-700 w-10 text-center">STT</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-2.5 border-b border-slate-700 font-bold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                  <td className="p-2.5 text-center font-mono text-slate-500">{rIdx + 1}</td>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="p-2.5">
                      {row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}