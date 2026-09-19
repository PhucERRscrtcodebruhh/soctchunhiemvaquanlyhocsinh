import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = '/api/thidua';

export default function ThiDuaLop() {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    tuan: 1,
    diem_so: 100,
    hang_khoi: 1,
    hang_truong: 1,
    co_thi_dua: 'Cờ Nhất'
  });

  const loadData = () => {
    fetch(API).then(r => r.json()).then(data => setList(Array.isArray(data) ? data : [])).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({
      tuan: (parseInt(form.tuan) || 0) + 1,
      diem_so: 100,
      hang_khoi: 1,
      hang_truong: 1,
      co_thi_dua: 'Cờ Nhất'
    });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa kết quả tuần này?')) return;
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
            tuan: parseInt(parts[0]) || 1,
            diem_so: parseFloat(parts[1]) || 100,
            hang_khoi: parseInt(parts[2]) || 1,
            hang_truong: parseInt(parts[3]) || 1,
            co_thi_dua: parts[4] || ''
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'BẢNG XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG',
      headers: ['Tuần', 'Điểm số', 'Xếp hạng Khối', 'Hạng Toàn trường', 'Cờ thi đua'],
      rows: list.map(it => [`Tuần ${it.tuan}`, it.diem_so, it.hang_khoi, it.hang_truong, it.co_thi_dua]),
      filename: 'Thi_Dua_Doan_Truong'
    });
  };

  return (
    <ModuleContainer title="XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG" desc="Tổng hợp kết quả nề nếp thi đua tuần (Nhập/Xuất Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button
            onClick={handleExportWord}
            disabled={list.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input
          type="number"
          min="1"
          placeholder="Tuần số"
          value={form.tuan}
          onChange={e => setForm({ ...form, tuan: parseInt(e.target.value) || 1 })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          type="number"
          step="0.1"
          placeholder="Điểm số"
          value={form.diem_so}
          onChange={e => setForm({ ...form, diem_so: parseFloat(e.target.value) || 0 })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Hạng Khối"
          value={form.hang_khoi}
          onChange={e => setForm({ ...form, hang_khoi: parseInt(e.target.value) || 1 })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          type="number"
          min="1"
          placeholder="Hạng Toàn trường"
          value={form.hang_truong}
          onChange={e => setForm({ ...form, hang_truong: parseInt(e.target.value) || 1 })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Cờ thi đua (Cờ Nhất/Nhì...)"
          value={form.co_thi_dua}
          onChange={e => setForm({ ...form, co_thi_dua: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm tuần
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-center text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Tuần</th>
              <th className="p-3">Điểm số</th>
              <th className="p-3">Xếp hạng Khối</th>
              <th className="p-3">Hạng Toàn trường</th>
              <th className="p-3">Cờ thi đua</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {list.map(it => {
              const isEdit = editingId === it.id;
              return (
                <tr key={it.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-cyan-400">Tuần {it.tuan}</td>
                  {isEdit ? (
                    <>
                      <td className="p-2"><input type="number" step="0.1" value={editForm.diem_so || 0} onChange={e => setEditForm({ ...editForm, diem_so: parseFloat(e.target.value) || 0 })} className="w-20 px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-center text-xs text-white mx-auto" /></td>
                      <td className="p-2"><input type="number" value={editForm.hang_khoi || 1} onChange={e => setEditForm({ ...editForm, hang_khoi: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-center text-xs text-white mx-auto" /></td>
                      <td className="p-2"><input type="number" value={editForm.hang_truong || 1} onChange={e => setEditForm({ ...editForm, hang_truong: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-center text-xs text-white mx-auto" /></td>
                      <td className="p-2"><input value={editForm.co_thi_dua || ''} onChange={e => setEditForm({ ...editForm, co_thi_dua: e.target.value })} className="w-28 px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-center text-xs text-white mx-auto" /></td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleUpdate(it.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-mono font-bold text-white">{it.diem_so}</td>
                      <td className="p-3">{it.hang_khoi}</td>
                      <td className="p-3">{it.hang_truong}</td>
                      <td className="p-3 text-amber-400 font-semibold">{it.co_thi_dua || '-'}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingId(it.id); setEditForm(it); }} className="text-cyan-400 hover:text-cyan-300"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(it.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr><td colSpan="6" className="py-8 text-center text-slate-500">Chưa có kết quả thi đua tuần</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}