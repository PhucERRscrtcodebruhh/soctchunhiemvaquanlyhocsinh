import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Users, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = 'http://localhost:5000/api/to-hocsinh';

export default function SoDoLopHoc() {
  const [students, setStudents] = useState([]);
  const [toSo, setToSo] = useState(1);
  const [hoTen, setHoTen] = useState('');
  const [chucVu, setChucVu] = useState('Thành viên');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadData = () => {
    fetch(API).then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : [])).catch(console.error);
  };

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

  const handleUpdateHS = async (id) => {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDeleteHS = async (id) => {
    if (!window.confirm('Xác nhận xóa học sinh khỏi tổ?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_so: parseInt(parts[0]) || 1,
            ho_ten: parts[1],
            chuc_vu_to: parts[2] || 'Thành viên',
            ghi_chu: parts[3] || ''
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'DANH SÁCH HỌC SINH THEO TỔ',
      headers: ['STT', 'Tổ số', 'Họ và tên học sinh', 'Chức vụ trong tổ', 'Ghi chú'],
      rows: students.map((it, idx) => [idx + 1, `Tổ ${it.to_so}`, it.ho_ten, it.chuc_vu_to, it.ghi_chu || '']),
      filename: 'Danh_Sach_Chia_To'
    });
  };

  return (
    <ModuleContainer title="DANH SÁCH CHIA TỔ & SƠ ĐỒ LỚP" desc="Quản lý học sinh theo từng tổ (Hỗ trợ nhập/xuất tệp Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button
            onClick={handleExportWord}
            disabled={students.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleAddHS} className="flex flex-wrap gap-2 mb-6 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <select
          value={toSo}
          onChange={e => setToSo(Number(e.target.value))}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        >
          {[1, 2, 3, 4].map(t => <option key={t} value={t}>Tổ {t}</option>)}
        </select>
        <input
          placeholder="Họ và tên học sinh *"
          value={hoTen}
          onChange={e => setHoTen(e.target.value)}
          className="flex-1 min-w-[180px] px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          placeholder="Chức vụ (Tổ trưởng/Tổ phó/Thành viên)"
          value={chucVu}
          onChange={e => setChucVu(e.target.value)}
          className="w-48 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm vào tổ
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(t => {
          const group = students.filter(s => s.to_so === t);
          return (
            <div key={t} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                <h4 className="font-bold text-cyan-400 text-xs uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Tổ {t}
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">{group.length} học sinh</span>
              </div>
              <ul className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {group.map((st, idx) => {
                  const isEdit = editingId === st.id;
                  return (
                    <li key={st.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs">
                      {isEdit ? (
                        <div className="space-y-1.5">
                          <input
                            value={editForm.ho_ten || ''}
                            onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })}
                            className="w-full px-1.5 py-1 bg-slate-950 border border-cyan-500/50 rounded text-xs text-white"
                          />
                          <div className="flex gap-1">
                            <select
                              value={editForm.to_so || t}
                              onChange={e => setEditForm({ ...editForm, to_so: Number(e.target.value) })}
                              className="px-1 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-white"
                            >
                              {[1, 2, 3, 4].map(n => <option key={n} value={n}>Tổ {n}</option>)}
                            </select>
                            <input
                              value={editForm.chuc_vu_to || ''}
                              onChange={e => setEditForm({ ...editForm, chuc_vu_to: e.target.value })}
                              className="flex-1 px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-white"
                            />
                          </div>
                          <div className="flex justify-end gap-1 pt-1">
                            <button onClick={() => handleUpdateHS(st.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3 h-3" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">{idx + 1}. {st.ho_ten}</div>
                            <div className="text-[10px] text-cyan-400/80">{st.chuc_vu_to}</div>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => { setEditingId(st.id); setEditForm(st); }} className="text-cyan-400 hover:text-cyan-300"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteHS(st.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
                {group.length === 0 && (
                  <li className="text-[11px] text-slate-600 italic py-6 text-center">Chưa có học sinh</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </ModuleContainer>
  );
}