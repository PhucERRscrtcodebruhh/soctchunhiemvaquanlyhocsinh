import React, { useState, useEffect } from 'react';
import ModuleContainer from '../../components/ModuleContainer';
import { Upload, Download, Plus, Trash2 } from 'lucide-react';
import { parseDocxTable, exportDocxTable, API_BASE } from '../../utils/wordHandler';

export default function CanBoLopDoan() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    chuc_vu: 'Lớp trưởng', ho_ten: '', so_dien_thoai: '', nhiem_vu: '', loai_can_bo: 'LOP'
  });

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/canbo`);
      if (res.ok) {
        setList(await res.json());
        return;
      }
    } catch {}
    const local = localStorage.getItem('tbl_canbo');
    if (local) setList(JSON.parse(local));
  };

  useEffect(() => { fetchList(); }, []);

  const saveLocal = (data) => {
    setList(data);
    localStorage.setItem('tbl_canbo', JSON.stringify(data));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.ho_ten.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/canbo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        fetchList();
        setForm({ ...form, ho_ten: '', so_dien_thoai: '', nhiem_vu: '' });
        return;
      }
    } catch {}
    saveLocal([...list, { id: Date.now(), ...form }]);
    setForm({ ...form, ho_ten: '', so_dien_thoai: '', nhiem_vu: '' });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/canbo/${id}`, { method: 'DELETE' });
    } catch {}
    saveLocal(list.filter(item => item.id !== id));
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await parseDocxTable(file);
      const dataRows = (rows[0] && rows[0][1]?.toLowerCase().includes('chức')) ? rows.slice(1) : rows;

      const parsed = dataRows.map((r, i) => ({
        stt: i + 1,
        chuc_vu: r[1] || 'Cán bộ',
        ho_ten: r[2] || '',
        so_dien_thoai: r[3] || '',
        nhiem_vu: r[4] || '',
        loai_can_bo: (r[1]?.toLowerCase().includes('bí thư') || r[1]?.toLowerCase().includes('đoàn')) ? 'DOAN' : 'LOP'
      })).filter(x => x.ho_ten);

      try {
        await fetch(`${API_BASE}/canbo/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        fetchList();
      } catch {
        saveLocal([...list, ...parsed]);
      }
    } catch {
      alert('Lỗi đọc Word!');
    }
  };

  const handleExportWord = () => {
    exportDocxTable({
      filename: 'Can_Bo_Lop_Doan',
      title: 'DANH SÁCH CÁN BỘ LỚP VÀ CÁN BỘ ĐOÀN',
      headers: ['STT', 'Phân loại', 'Chức vụ', 'Họ và tên', 'Số điện thoại', 'Nhiệm vụ'],
      rows: list.map((item, idx) => [
        idx + 1,
        item.loai_can_bo === 'DOAN' ? 'Chi Đoàn' : 'Ban cán sự Lớp',
        item.chuc_vu,
        item.ho_ten,
        item.so_dien_thoai,
        item.nhiem_vu
      ])
    });
  };

  return (
    <ModuleContainer title="CÁN BỘ LỚP - CÁN BỘ ĐOÀN" desc="Nhập Word, xuất Word, thêm/xóa cán bộ lớp & Đoàn">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-4 h-4" /> <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition">
            <Download className="w-4 h-4 text-cyan-400" /> <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-4 bg-slate-950/40 border border-slate-800 rounded-xl mb-4 text-xs">
        <select value={form.loai_can_bo} onChange={e => setForm({ ...form, loai_can_bo: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none">
          <option value="LOP">Ban cán sự Lớp</option>
          <option value="DOAN">BCH Chi Đoàn</option>
        </select>
        <input type="text" required placeholder="Chức vụ..." value={form.chuc_vu} onChange={e => setForm({ ...form, chuc_vu: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none" />
        <input type="text" required placeholder="Họ và tên..." value={form.ho_ten} onChange={e => setForm({ ...form, ho_ten: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white md:col-span-2 focus:border-cyan-500 outline-none" />
        <input type="text" placeholder="Số điện thoại..." value={form.so_dien_thoai} onChange={e => setForm({ ...form, so_dien_thoai: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none" />
        <button type="submit" className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-1 transition">
          <Plus className="w-4 h-4" /> Thêm Cán Bộ
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-3">STT</th>
              <th className="p-3">Phân loại</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3 text-right">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {list.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-500">Chưa có cán bộ nào</td></tr>
            ) : (
              list.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.loai_can_bo === 'DOAN' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                      {item.loai_can_bo === 'DOAN' ? 'Đoàn' : 'Lớp'}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-white">{item.chuc_vu}</td>
                  <td className="p-3 text-slate-200">{item.ho_ten}</td>
                  <td className="p-3">{item.so_dien_thoai || '-'}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}