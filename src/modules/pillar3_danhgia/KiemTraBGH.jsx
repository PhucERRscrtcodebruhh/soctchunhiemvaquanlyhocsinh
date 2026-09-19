import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = '/api/bgh';

export default function KiemTraBGH() {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    dot_kiem_tra: 'Sơ kết Học kỳ I',
    ngay_duyet: new Date().toISOString().slice(0, 10),
    y_kien_bgh: 'Hồ sơ sổ đầy đủ, theo dõi nề nếp sát sao',
    xep_loai: 'Tốt'
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
      dot_kiem_tra: 'Tổng kết Cuối năm học',
      ngay_duyet: new Date().toISOString().slice(0, 10),
      y_kien_bgh: 'Hoàn thành tốt nhiệm vụ chủ nhiệm',
      xep_loai: 'Tốt'
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
    if (!window.confirm('Xác nhận xóa nhận xét này?')) return;
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
            dot_kiem_tra: parts[0],
            ngay_duyet: parts[1] || new Date().toISOString().slice(0, 10),
            y_kien_bgh: parts[2] || '',
            xep_loai: parts[3] || 'Tốt'
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'Ý KIẾN BAN GIÁM HIỆU KIỂM TRA SỔ CHỦ NHIỆM',
      headers: ['STT', 'Đợt kiểm tra', 'Ngày duyệt', 'Ý kiến nhận xét BGH', 'Xếp loại'],
      rows: list.map((it, idx) => [
        idx + 1,
        it.dot_kiem_tra,
        it.ngay_duyet ? String(it.ngay_duyet).slice(0, 10) : '',
        it.y_kien_bgh,
        it.xep_loai
      ]),
      filename: 'BGH_Kiem_Tra_So_Chu_Nhiem'
    });
  };

  return (
    <ModuleContainer title="BGH KIỂM TRA & NHẬN XÉT SỔ CHỦ NHIỆM" desc="Ý kiến chỉ đạo và phê duyệt hồ sơ từ BGH (Nhập/Xuất Word .docx)">
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

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input
          placeholder="Đợt kiểm tra *"
          value={form.dot_kiem_tra}
          onChange={e => setForm({ ...form, dot_kiem_tra: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          type="date"
          value={form.ngay_duyet}
          onChange={e => setForm({ ...form, ngay_duyet: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          placeholder="Ý kiến nhận xét của BGH"
          value={form.y_kien_bgh}
          onChange={e => setForm({ ...form, y_kien_bgh: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <select
          value={form.xep_loai}
          onChange={e => setForm({ ...form, xep_loai: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value="Tốt">Xếp loại: Tốt</option>
          <option value="Khá">Xếp loại: Khá</option>
          <option value="Đạt yêu cầu">Xếp loại: Đạt</option>
        </select>
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm nhận xét
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Đợt kiểm tra</th>
              <th className="p-3">Ngày duyệt</th>
              <th className="p-3">Ý kiến nhận xét của BGH</th>
              <th className="p-3">Xếp loại</th>
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
                      <td className="p-2"><input value={editForm.dot_kiem_tra || ''} onChange={e => setEditForm({ ...editForm, dot_kiem_tra: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input type="date" value={editForm.ngay_duyet ? String(editForm.ngay_duyet).slice(0, 10) : ''} onChange={e => setEditForm({ ...editForm, ngay_duyet: e.target.value })} className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.y_kien_bgh || ''} onChange={e => setEditForm({ ...editForm, y_kien_bgh: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2">
                        <select value={editForm.xep_loai || 'Tốt'} onChange={e => setEditForm({ ...editForm, xep_loai: e.target.value })} className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white">
                          <option value="Tốt">Tốt</option>
                          <option value="Khá">Khá</option>
                          <option value="Đạt yêu cầu">Đạt</option>
                        </select>
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
                      <td className="p-3 font-semibold text-white">{it.dot_kiem_tra}</td>
                      <td className="p-3 text-slate-400 font-mono">{it.ngay_duyet ? String(it.ngay_duyet).slice(0, 10) : '-'}</td>
                      <td className="p-3">{it.y_kien_bgh || '-'}</td>
                      <td className="p-3 font-semibold text-emerald-400">{it.xep_loai || 'Tốt'}</td>
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
              <tr><td colSpan="6" className="py-8 text-center text-slate-500">Chưa có ý kiến kiểm tra từ Ban Giám Hiệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}