import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = 'http://localhost:5000/api/tt22';

export default function DanhGiaTT22() {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    ho_ten: '',
    hk1_ht: 'Tốt',
    hk1_rl: 'Tốt',
    cn_ht: 'Tốt',
    danh_hieu: 'Học sinh Xuất sắc'
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
    setForm({ ho_ten: '', hk1_ht: 'Tốt', hk1_rl: 'Tốt', cn_ht: 'Tốt', danh_hieu: 'Học sinh Xuất sắc' });
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
    if (!window.confirm('Xác nhận xóa bản ghi đánh giá này?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ho_ten: parts[0],
            hk1_ht: parts[1] || 'Đạt',
            hk1_rl: parts[2] || 'Tốt',
            cn_ht: parts[3] || 'Đạt',
            danh_hieu: parts[4] || 'Học sinh Tiên tiến'
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'TỔNG HỢP ĐÁNH GIÁ XẾP LOẠI THEO THÔNG TƯ 22',
      headers: ['STT', 'Họ và tên', 'Học tập HK1', 'Rèn luyện HK1', 'Học tập Cả năm', 'Danh hiệu'],
      rows: list.map((it, idx) => [idx + 1, it.ho_ten, it.hk1_ht, it.hk1_rl, it.cn_ht, it.danh_hieu]),
      filename: 'Tong_Hop_Danh_Gia_TT22'
    });
  };

  return (
    <ModuleContainer title="TỔNG HỢP XẾP LOẠI HỌC SINH THEO THÔNG TƯ 22" desc="Đánh giá kết quả Rèn luyện và Học tập (Nhập/Xuất Word .docx)">
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
          placeholder="Họ và tên học sinh *"
          value={form.ho_ten}
          onChange={e => setForm({ ...form, ho_ten: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <select value={form.hk1_ht} onChange={e => setForm({ ...form, hk1_ht: e.target.value })} className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
          <option value="Tốt">HT HK1: Tốt</option>
          <option value="Khá">HT HK1: Khá</option>
          <option value="Đạt">HT HK1: Đạt</option>
          <option value="Chưa đạt">HT HK1: Chưa đạt</option>
        </select>
        <select value={form.hk1_rl} onChange={e => setForm({ ...form, hk1_rl: e.target.value })} className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
          <option value="Tốt">RL HK1: Tốt</option>
          <option value="Khá">RL HK1: Khá</option>
          <option value="Đạt">RL HK1: Đạt</option>
          <option value="Chưa đạt">RL HK1: Chưa đạt</option>
        </select>
        <select value={form.cn_ht} onChange={e => setForm({ ...form, cn_ht: e.target.value })} className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
          <option value="Tốt">HT Cả năm: Tốt</option>
          <option value="Khá">HT Cả năm: Khá</option>
          <option value="Đạt">HT Cả năm: Đạt</option>
          <option value="Chưa đạt">HT Cả năm: Chưa đạt</option>
        </select>
        <input
          placeholder="Danh hiệu khen thưởng"
          value={form.danh_hieu}
          onChange={e => setForm({ ...form, danh_hieu: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm xếp loại
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3">Học tập HK1</th>
              <th className="p-3">Rèn luyện HK1</th>
              <th className="p-3">Học tập Cả năm</th>
              <th className="p-3">Danh hiệu</th>
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
                      <td className="p-2"><input value={editForm.ho_ten || ''} onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.hk1_ht || ''} onChange={e => setEditForm({ ...editForm, hk1_ht: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.hk1_rl || ''} onChange={e => setEditForm({ ...editForm, hk1_rl: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.cn_ht || ''} onChange={e => setEditForm({ ...editForm, cn_ht: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.danh_hieu || ''} onChange={e => setEditForm({ ...editForm, danh_hieu: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleUpdate(it.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-semibold text-white">{it.ho_ten}</td>
                      <td className="p-3">{it.hk1_ht}</td>
                      <td className="p-3">{it.hk1_rl}</td>
                      <td className="p-3">{it.cn_ht}</td>
                      <td className="p-3 text-emerald-400 font-medium">{it.danh_hieu || '-'}</td>
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
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Chưa có kết quả tổng hợp xếp loại học sinh</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}