import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = 'http://localhost:5000/api/bangiao';

export default function BienBanBanGiao({ classData }) {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    dot_ban_giao: 'Nghỉ Tết Nguyên Đán 2026',
    ngay_ban_giao: new Date().toISOString().slice(0, 10),
    si_so: classData?.totalStudents || 0,
    tinh_trang: '100% chấp hành an toàn giao thông và phòng chống pháo nổ',
    dai_dien_dia_phuong: 'Đoàn xã / UBND'
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
      dot_ban_giao: 'Sinh hoạt hè 2026',
      ngay_ban_giao: new Date().toISOString().slice(0, 10),
      si_so: classData?.totalStudents || 0,
      tinh_trang: 'Bàn giao học sinh về địa phương quản lý',
      dai_dien_dia_phuong: 'Đoàn xã'
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
    if (!window.confirm('Xác nhận xóa biên bản này?')) return;
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
            dot_ban_giao: parts[0],
            ngay_ban_giao: parts[1] || new Date().toISOString().slice(0, 10),
            si_so: parseInt(parts[2]) || 0,
            tinh_trang: parts[3] || '',
            dai_dien_dia_phuong: parts[4] || ''
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'HỒ SƠ BIÊN BẢN BÀN GIAO HỌC SINH NGHỈ TẾT & SINH HOẠT HÈ',
      headers: ['STT', 'Đợt bàn giao', 'Ngày bàn giao', 'Sĩ số', 'Tình trạng nề nếp', 'Đại diện địa phương'],
      rows: list.map((it, idx) => [
        idx + 1,
        it.dot_ban_giao,
        it.ngay_ban_giao ? String(it.ngay_ban_giao).slice(0, 10) : '',
        it.si_so,
        it.tinh_trang,
        it.dai_dien_dia_phuong
      ]),
      filename: 'Bien_Ban_Ban_Giao_Tet_He'
    });
  };

  return (
    <ModuleContainer title="BIÊN BẢN BÀN GIAO NGHỈ TẾT & SINH HOẠT HÈ" desc="Hồ sơ bàn giao học sinh về gia đình & địa phương (Nhập/Xuất Word .docx)">
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
          placeholder="Đợt bàn giao *"
          value={form.dot_ban_giao}
          onChange={e => setForm({ ...form, dot_ban_giao: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          type="date"
          value={form.ngay_ban_giao}
          onChange={e => setForm({ ...form, ngay_ban_giao: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <input
          type="number"
          placeholder="Sĩ số"
          value={form.si_so}
          onChange={e => setForm({ ...form, si_so: parseInt(e.target.value) || 0 })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Tình trạng cam kết"
          value={form.tinh_trang}
          onChange={e => setForm({ ...form, tinh_trang: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Đại diện địa phương"
          value={form.dai_dien_dia_phuong}
          onChange={e => setForm({ ...form, dai_dien_dia_phuong: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Tạo biên bản
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Đợt bàn giao</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Sĩ số</th>
              <th className="p-3">Tình trạng nề nếp</th>
              <th className="p-3">Đại diện địa phương</th>
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
                      <td className="p-2"><input value={editForm.dot_ban_giao || ''} onChange={e => setEditForm({ ...editForm, dot_ban_giao: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input type="date" value={editForm.ngay_ban_giao ? String(editForm.ngay_ban_giao).slice(0, 10) : ''} onChange={e => setEditForm({ ...editForm, ngay_ban_giao: e.target.value })} className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input type="number" value={editForm.si_so || 0} onChange={e => setEditForm({ ...editForm, si_so: parseInt(e.target.value) || 0 })} className="w-16 px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.tinh_trang || ''} onChange={e => setEditForm({ ...editForm, tinh_trang: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.dai_dien_dia_phuong || ''} onChange={e => setEditForm({ ...editForm, dai_dien_dia_phuong: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleUpdate(it.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-semibold text-white">{it.dot_ban_giao}</td>
                      <td className="p-3 text-slate-400 font-mono">{it.ngay_ban_giao ? String(it.ngay_ban_giao).slice(0, 10) : '-'}</td>
                      <td className="p-3 font-mono font-bold text-cyan-400">{it.si_so} HS</td>
                      <td className="p-3">{it.tinh_trang || '-'}</td>
                      <td className="p-3">{it.dai_dien_dia_phuong || '-'}</td>
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
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Chưa có biên bản bàn giao nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}