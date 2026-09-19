import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = '/api/phuhuynh';

export default function BanDaiDienPHHS() {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    ho_ten_ph: '',
    phu_huynh_em: '',
    chuc_vu: 'Thành viên',
    so_dien_thoai: '',
    dia_chi: ''
  });

  const loadData = () => {
    fetch(API).then(r => r.json()).then(data => setList(Array.isArray(data) ? data : [])).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.ho_ten_ph.trim()) return;
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ ho_ten_ph: '', phu_huynh_em: '', chuc_vu: 'Thành viên', so_dien_thoai: '', dia_chi: '' });
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
    if (!window.confirm('Xác nhận xóa phụ huynh này?')) return;
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
            ho_ten_ph: parts[0],
            phu_huynh_em: parts[1] || '',
            chuc_vu: parts[2] || 'Ủy viên',
            so_dien_thoai: parts[3] || '',
            dia_chi: parts[4] || ''
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH',
      headers: ['STT', 'Họ và tên PHHS', 'Phụ huynh của em', 'Chức vụ', 'Số điện thoại', 'Địa chỉ'],
      rows: list.map((item, idx) => [idx + 1, item.ho_ten_ph, item.phu_huynh_em, item.chuc_vu, item.so_dien_thoai, item.dia_chi]),
      filename: 'Ban_Dai_Dien_PHHS'
    });
  };

  return (
    <ModuleContainer title="BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH" desc="Quản lý thông tin Ban đại diện PHHS (Hỗ trợ nhập/xuất tệp Word .docx)">
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
          placeholder="Họ tên PHHS *"
          value={form.ho_ten_ph}
          onChange={e => setForm({ ...form, ho_ten_ph: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          placeholder="PH em..."
          value={form.phu_huynh_em}
          onChange={e => setForm({ ...form, phu_huynh_em: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Chức vụ"
          value={form.chuc_vu}
          onChange={e => setForm({ ...form, chuc_vu: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Số điện thoại"
          value={form.so_dien_thoai}
          onChange={e => setForm({ ...form, so_dien_thoai: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Địa chỉ"
          value={form.dia_chi}
          onChange={e => setForm({ ...form, dia_chi: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm PH
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Họ và tên PH</th>
              <th className="p-3">PH em</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Địa chỉ</th>
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
                          value={editForm.ho_ten_ph || ''}
                          onChange={e => setEditForm({ ...editForm, ho_ten_ph: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.phu_huynh_em || ''}
                          onChange={e => setEditForm({ ...editForm, phu_huynh_em: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.chuc_vu || ''}
                          onChange={e => setEditForm({ ...editForm, chuc_vu: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.so_dien_thoai || ''}
                          onChange={e => setEditForm({ ...editForm, so_dien_thoai: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={editForm.dia_chi || ''}
                          onChange={e => setEditForm({ ...editForm, dia_chi: e.target.value })}
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
                      <td className="p-3 font-semibold text-white">{it.ho_ten_ph}</td>
                      <td className="p-3">{it.phu_huynh_em || '-'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold text-[10px]">
                          {it.chuc_vu}
                        </span>
                      </td>
                      <td className="p-3">{it.so_dien_thoai || '-'}</td>
                      <td className="p-3">{it.dia_chi || '-'}</td>
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
                <td colSpan="7" className="py-8 text-center text-slate-500">Chưa có thông tin ban đại diện cha mẹ học sinh</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}