import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = '/api/theodoi';

export default function TheoDoiHocTap() {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    ngay_thang: new Date().toISOString().slice(0, 10),
    ho_ten: '',
    mon_hoc: '',
    diem_nhan_xet: '',
    vi_pham_khen_thuong: ''
  });

  const loadData = () => {
    fetch(API).then(r => r.json()).then(data => setList(Array.isArray(data) ? data : [])).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.ho_ten.trim()) return;
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({
      ngay_thang: new Date().toISOString().slice(0, 10),
      ho_ten: '',
      mon_hoc: '',
      diem_nhan_xet: '',
      vi_pham_khen_thuong: ''
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
    if (!window.confirm('Xác nhận xóa bản ghi theo dõi này?')) return;
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
            ngay_thang: parts[0] || new Date().toISOString().slice(0, 10),
            ho_ten: parts[1],
            mon_hoc: parts[2] || '',
            diem_nhan_xet: parts[3] || '',
            vi_pham_khen_thuong: parts[4] || ''
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'SỔ THEO DÕI HỌC TẬP VÀ RÈN LUYỆN',
      headers: ['STT', 'Ngày', 'Họ và tên học sinh', 'Môn học', 'Điểm / Nhận xét', 'Vi phạm / Khen thưởng'],
      rows: list.map((it, idx) => [
        idx + 1,
        it.ngay_thang ? String(it.ngay_thang).slice(0, 10) : '',
        it.ho_ten,
        it.mon_hoc,
        it.diem_nhan_xet,
        it.vi_pham_khen_thuong
      ]),
      filename: 'Theo_Doi_Hoc_Tap'
    });
  };

  return (
    <ModuleContainer title="THEO DÕI HỌC TẬP & RÈN LUYỆN" desc="Nhật ký nề nếp, điểm số hàng ngày (Nhập/Xuất văn bản Word .docx)">
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
          type="date"
          value={form.ngay_thang}
          onChange={e => setForm({ ...form, ngay_thang: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          placeholder="Họ và tên học sinh *"
          value={form.ho_ten}
          onChange={e => setForm({ ...form, ho_ten: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          placeholder="Môn học"
          value={form.mon_hoc}
          onChange={e => setForm({ ...form, mon_hoc: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Điểm / Nhận xét"
          value={form.diem_nhan_xet}
          onChange={e => setForm({ ...form, diem_nhan_xet: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Vi phạm / Khen thưởng"
          value={form.vi_pham_khen_thuong}
          onChange={e => setForm({ ...form, vi_pham_khen_thuong: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm ghi nhận
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3">Môn</th>
              <th className="p-3">Điểm / Nhận xét</th>
              <th className="p-3">Vi phạm / Khen thưởng</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {list.map((it, idx) => {
              const isEdit = editingId === it.id;
              return (
                <tr key={it.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                  {isEdit ? (
                    <>
                      <td className="p-2">
                        <input
                          type="date"
                          value={editForm.ngay_thang ? String(editForm.ngay_thang).slice(0, 10) : ''}
                          onChange={e => setEditForm({ ...editForm, ngay_thang: e.target.value })}
                          className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.ho_ten || ''}
                          onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.mon_hoc || ''}
                          onChange={e => setEditForm({ ...editForm, mon_hoc: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.diem_nhan_xet || ''}
                          onChange={e => setEditForm({ ...editForm, diem_nhan_xet: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.vi_pham_khen_thuong || ''}
                          onChange={e => setEditForm({ ...editForm, vi_pham_khen_thuong: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleUpdate(it.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 text-slate-400">{it.ngay_thang ? String(it.ngay_thang).slice(0, 10) : '-'}</td>
                      <td className="p-3 font-semibold text-white">{it.ho_ten}</td>
                      <td className="p-3">{it.mon_hoc || '-'}</td>
                      <td className="p-3">{it.diem_nhan_xet || '-'}</td>
                      <td className="p-3">
                        <span className={it.vi_pham_khen_thuong?.toLowerCase().includes('khen') ? 'text-emerald-400' : 'text-amber-400'}>
                          {it.vi_pham_khen_thuong || '-'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingId(it.id); setEditForm(it); }} className="text-cyan-400 hover:text-cyan-300">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(it.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500">Chưa có nhật ký theo dõi học tập</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}