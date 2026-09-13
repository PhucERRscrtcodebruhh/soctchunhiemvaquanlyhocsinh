import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = 'http://localhost:5000/api/cabiet';

export default function GiaoDucCaBiet() {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    ho_ten: '',
    bieu_hien: '',
    bien_phap: '',
    xac_nhan_ph: 'Chưa ký'
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
    setForm({ ho_ten: '', bieu_hien: '', bien_phap: '', xac_nhan_ph: 'Chưa ký' });
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
    if (!window.confirm('Xác nhận xóa hồ sơ theo dõi học sinh này?')) return;
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
            bieu_hien: parts[1] || '',
            bien_phap: parts[2] || '',
            xac_nhan_ph: parts[3] || 'Chưa ký'
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'HỒ SƠ GIÁO DỤC HỌC SINH CÁ BIỆT',
      headers: ['STT', 'Họ và tên học sinh', 'Biểu hiện vi phạm', 'Biện pháp giáo dục của GVCN', 'Xác nhận của PHHS'],
      rows: list.map((it, idx) => [
        idx + 1,
        it.ho_ten,
        it.bieu_hien,
        it.bien_phap,
        it.xac_nhan_ph
      ]),
      filename: 'Giao_Duc_Hoc_Sinh_Ca_Biet'
    });
  };

  return (
    <ModuleContainer title="HỒ SƠ GIÁO DỤC HỌC SINH CÁ BIỆT" desc="Kế hoạch uốn nắn, phối hợp với phụ huynh (Nhập/Xuất văn bản Word .docx)">
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
          placeholder="Họ và tên học sinh *"
          value={form.ho_ten}
          onChange={e => setForm({ ...form, ho_ten: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          placeholder="Biểu hiện vi phạm"
          value={form.bieu_hien}
          onChange={e => setForm({ ...form, bieu_hien: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Biện pháp GVCN"
          value={form.bien_phap}
          onChange={e => setForm({ ...form, bien_phap: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <select
          value={form.xac_nhan_ph}
          onChange={e => setForm({ ...form, xac_nhan_ph: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value="Chưa ký">Chưa ký</option>
          <option value="Đã trao đổi">Đã trao đổi qua ĐT</option>
          <option value="Đã ký cam kết">Đã ký cam kết</option>
        </select>
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm hồ sơ
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3">Biểu hiện vi phạm</th>
              <th className="p-3">Biện pháp GVCN</th>
              <th className="p-3">Xác nhận PHHS</th>
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
                          value={editForm.ho_ten || ''}
                          onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.bieu_hien || ''}
                          onChange={e => setEditForm({ ...editForm, bieu_hien: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.bien_phap || ''}
                          onChange={e => setEditForm({ ...editForm, bien_phap: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={editForm.xac_nhan_ph || 'Chưa ký'}
                          onChange={e => setEditForm({ ...editForm, xac_nhan_ph: e.target.value })}
                          className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        >
                          <option value="Chưa ký">Chưa ký</option>
                          <option value="Đã trao đổi">Đã trao đổi qua ĐT</option>
                          <option value="Đã ký cam kết">Đã ký cam kết</option>
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
                      <td className="p-3 font-semibold text-white">{it.ho_ten}</td>
                      <td className="p-3 text-amber-300/90">{it.bieu_hien || '-'}</td>
                      <td className="p-3">{it.bien_phap || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${it.xac_nhan_ph === 'Đã ký cam kết' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          {it.xac_nhan_ph || 'Chưa ký'}
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
                <td colSpan="6" className="py-8 text-center text-slate-500">Không có học sinh trong diện theo dõi đặc biệt</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}