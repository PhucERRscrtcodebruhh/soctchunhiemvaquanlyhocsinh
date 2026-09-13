import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Trash2, Plus } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';

export default function LyLichHocSinh({ classData }) {
  const [columns, setColumns] = useState(['STT', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Họ tên Cha/Mẹ', 'SĐT']);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [newRow, setNewRow] = useState({ name: '', dob: '', gender: 'Nam', parent: '', phone: '' });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data && data.length > 0) {
        const headers = data[0].filter(h => h !== undefined && h !== null && h !== '');
        const contentRows = data.slice(1).filter(r => r && r.some(c => c !== undefined && c !== null && c !== ''));
        setColumns(headers);
        setRows(contentRows);
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleAddManualRow = (e) => {
    e.preventDefault();
    if (!newRow.name) return;
    setRows(prev => [...prev, [prev.length + 1, newRow.name, newRow.dob, newRow.gender, newRow.parent, newRow.phone]]);
    setNewRow({ name: '', dob: '', gender: 'Nam', parent: '', phone: '' });
  };

  const handleDeleteRow = (index) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setRows([]);
    setFileName('');
  };

  return (
    <ModuleContainer title="SƠ YẾU LÝ LỊCH HỌC SINH" desc="Nhập danh sách bằng tệp Excel (.xlsx, .xls) và quản lý hồ sơ học sinh">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition">
            <Upload className="w-4 h-4" />
            <span>Tải lên file Excel (.xlsx, .xls)</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
          {fileName && (
            <span className="text-xs text-cyan-400 font-mono">
              Tệp: <b>{fileName}</b> ({rows.length} hàng)
            </span>
          )}
        </div>

        {rows.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-1.5 border border-red-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa bảng</span>
          </button>
        )}
      </div>

      <form onSubmit={handleAddManualRow} className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input
          placeholder="Họ và tên *"
          value={newRow.name}
          onChange={e => setNewRow({ ...newRow, name: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          placeholder="Ngày sinh"
          value={newRow.dob}
          onChange={e => setNewRow({ ...newRow, dob: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <select
          value={newRow.gender}
          onChange={e => setNewRow({ ...newRow, gender: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
        <input
          placeholder="Họ tên Cha/Mẹ"
          value={newRow.parent}
          onChange={e => setNewRow({ ...newRow, parent: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Số điện thoại"
          value={newRow.phone}
          onChange={e => setNewRow({ ...newRow, phone: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm HS
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Chưa có dữ liệu danh sách học sinh</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Nhập nhanh học sinh qua mẫu ở trên hoặc tải lên file Excel (.xlsx, .xls).
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-800/95 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-3 text-center w-12">STT</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3 font-bold">{col}</th>
                ))}
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40">
                  <td className="p-3 text-center text-slate-500 font-mono">{rIdx + 1}</td>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="p-3">
                      {row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : '-'}
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <button onClick={() => handleDeleteRow(rIdx)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModuleContainer>
  );
}