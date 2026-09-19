import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = '/api/sinhhoat';

export default function SinhHoatLop() {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    tuan: 1,
    ngay_hop: new Date().toISOString().slice(0, 10),
    danh_gia: '',
    phuong_huong: '',
    tuyen_duong: ''
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
      ngay_hop: new Date().toISOString().slice(0, 10),
      danh_gia: '',
      phuong_huong: '',
      tuyen_duong: ''
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
    if (!window.confirm('Xác nhận xóa biên bản tuần này?')) return;
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
            ngay_hop: parts[1] || new Date().toISOString().slice(0, 10),
            danh_gia: parts[2] || '',
            phuong_huong: parts[3] || '',
            tuyen_duong: parts[4] || ''
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'BIÊN BẢN & NỘI DUNG SINH HOẠT LỚP HÀNG TUẦN',
      headers: ['Tuần', 'Ngày họp', 'Đánh giá hoạt động tuần qua', 'Phương hướng kế hoạch tuần tới', 'Tuyên dương'],
      rows: list.map(it => [
        `Tuần ${it.tuan}`,
        it.ngay_hop ? String(it.ngay_hop).slice(0, 10) : '',
        it.danh_gia,
        it.phuong_huong,
        it.tuyen_duong
      ]),
      filename: 'Bien_Ban_Sinh_Hoat_Lop'
    });
  };

  return (
    <ModuleContainer title="NỘI DUNG & BIÊN BẢN SINH HOẠT LỚP" desc="Lập biên bản sinh hoạt Thứ 7, đánh giá nề nếp và phương hướng tuần (Word .docx)">
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

      <form onSubmit={handleCreate} className="space-y-3 mb-6 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Tuần số</label>
            <input
              type="number"
              min="1"
              value={form.tuan}
              onChange={e => setForm({ ...form, tuan: parseInt(e.target.value) || 1 })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Ngày sinh hoạt</label>
            <input
              type="date"
              value={form.ngay_hop}
              onChange={e => setForm({ ...form, ngay_hop: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Tuyên dương cá nhân / tổ</label>
            <input
              placeholder="VD: Tổ 1, em Nguyễn Văn A..."
              value={form.tuyen_duong}
              onChange={e => setForm({ ...form, tuyen_duong: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">1. Đánh giá hoạt động tuần qua</label>
            <textarea
              rows={3}
              placeholder="Nêu rõ ưu điểm nề nếp, các lỗi vi phạm trong tuần..."
              value={form.danh_gia}
              onChange={e => setForm({ ...form, danh_gia: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">2. Phương hướng & Kế hoạch tuần tới</label>
            <textarea
              rows={3}
              placeholder="Nhiệm vụ học tập, phong trào Đoàn trường, vệ sinh trực nhật..."
              value={form.phuong_huong}
              onChange={e => setForm({ ...form, phuong_huong: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
        </div>

        <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 ml-auto">
          <Plus className="w-3.5 h-3.5" /> Lưu biên bản tuần
        </button>
      </form>

      <div className="space-y-4">
        {list.map(it => {
          const isEdit = editingId === it.id;
          return (
            <div key={it.id} className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold text-xs">
                    Tuần {it.tuan}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" /> {it.ngay_hop ? String(it.ngay_hop).slice(0, 10) : ''}
                  </span>
                </div>
                <div className="flex gap-2">
                  {isEdit ? (
                    <>
                      <button onClick={() => handleUpdate(it.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(it.id); setEditForm(it); }} className="text-cyan-400 hover:text-cyan-300"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(it.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              </div>

              {isEdit ? (
                <div className="space-y-2 text-xs">
                  <textarea
                    rows={2}
                    value={editForm.danh_gia || ''}
                    onChange={e => setEditForm({ ...editForm, danh_gia: e.target.value })}
                    placeholder="Đánh giá tuần qua"
                    className="w-full p-2 bg-slate-900 border border-cyan-500/50 rounded text-white"
                  />
                  <textarea
                    rows={2}
                    value={editForm.phuong_huong || ''}
                    onChange={e => setEditForm({ ...editForm, phuong_huong: e.target.value })}
                    placeholder="Phương hướng tuần tới"
                    className="w-full p-2 bg-slate-900 border border-cyan-500/50 rounded text-white"
                  />
                  <input
                    value={editForm.tuyen_duong || ''}
                    onChange={e => setEditForm({ ...editForm, tuyen_duong: e.target.value })}
                    placeholder="Tuyên dương"
                    className="w-full p-2 bg-slate-900 border border-cyan-500/50 rounded text-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase text-[10px] mb-1">Đánh giá hoạt động tuần qua:</h5>
                    <p className="text-slate-200 whitespace-pre-line">{it.danh_gia || 'Chưa có nội dung đánh giá.'}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase text-[10px] mb-1">Phương hướng kế hoạch tuần tới:</h5>
                    <p className="text-slate-200 whitespace-pre-line">{it.phuong_huong || 'Chưa có kế hoạch phương hướng.'}</p>
                  </div>
                  {it.tuyen_duong && (
                    <div className="col-span-full pt-1 text-emerald-400">
                      ★ <b>Tuyên dương:</b> {it.tuyen_duong}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Chưa có biên bản sinh hoạt lớp nào được lập
          </div>
        )}
      </div>
    </ModuleContainer>
  );
}