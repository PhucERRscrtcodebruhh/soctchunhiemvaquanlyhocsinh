import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Users } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocx, exportDocxTable } from '../../utils/wordHandler';

const API = 'http://localhost:5000/api/to-hocsinh';

export default function SoDoLopHoc() {
  const [students, setStudents] = useState([]);
  const [toSo, setToSo] = useState(1);
  const [hoTen, setHoTen] = useState('');
  const [chucVu, setChucVu] = useState('Thành viên');

  const loadData = () => fetch(API).then(r => r.json()).then(setStudents).catch(console.error);
  useEffect(() => { loadData(); }, []);

  const handleAddHS = async (e) => {
    e.preventDefault();
    if (!hoTen.trim()) return;
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_so: toSo, ho_ten: hoTen.trim(), chuc_vu_to: chucVu })
    });
    setHoTen('');
    loadData();
  };

  const handleDeleteHS = async (id) => {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocx(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_so: parseInt(parts[0]) || 1,
            ho_ten: parts[1],
            chuc_vu_to: parts[2] || 'Thành viên'
          })
        });
      }
    }
    loadData();
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'DANH SÁCH HỌC SINH THEO TỔ',
      headers: ['STT', 'Tổ số', 'Họ và tên học sinh', 'Nhiệm vụ trong tổ'],
      rows: students.map((it, idx) => [idx + 1, `Tổ ${it.to_so}`, it.ho_ten, it.chuc_vu_to]),
      filename: 'Danh_Sach_Chia_To'
    });
  };

  return (
    <ModuleContainer title="DANH SÁCH CHIA TỔ & SƠ ĐỒ LỚP" desc="Nhập/Xuất văn bản Word, thêm và xóa học sinh theo từng tổ">
      <div className="flex flex-wrap justify-between gap-3 mb-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="flex gap-2">
          <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Nhập Word (.docx)
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Xuất Word
          </button>
        </div>
      </div>

      <form onSubmit={handleAddHS} className="flex flex-wrap gap-2 mb-6 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <select value={toSo} onChange={e => setToSo(Number(e.target.value))} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
          {[1, 2, 3, 4].map(t => <option key={t} value={t}>Tổ {t}</option>)}
        </select>
        <input
          placeholder="Nhập họ tên học sinh..."
          value={hoTen}
          onChange={e => setHoTen(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          placeholder="Chức vụ tổ (Tổ trưởng/Tổ phó/Thành viên)"
          value={chucVu}
          onChange={e => setChucVu(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Thêm HS vào Tổ
        </button>
      </form>

      {/* 4 Khối chia theo 4 Tổ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(t => {
          const group = students.filter(s => s.to_so === t);
          return (
            <div key={t} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                <h4 className="font-bold text-cyan-400 text-xs uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Tổ {t}
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">{group.length} HS</span>
              </div>
              <ul className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {group.map((st, idx) => (
                  <li key={st.id} className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800 text-xs">
                    <div>
                      <div className="font-medium text-white">{idx + 1}. {st.ho_ten}</div>
                      <div className="text-[10px] text-slate-500">{st.chuc_vu_to}</div>
                    </div>
                    <button onClick={() => handleDeleteHS(st.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
                {group.length === 0 && <li className="text-[11px] text-slate-600 italic py-4 text-center">Chưa có học sinh</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </ModuleContainer>
  );
}