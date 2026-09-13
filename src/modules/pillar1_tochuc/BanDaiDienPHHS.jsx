import React, { useState, useEffect } from 'react';
import ModuleContainer from '../../components/ModuleContainer';
import { Upload, Download, Plus, Trash2 } from 'lucide-react';
import { parseDocxTable, exportDocxTable, API_BASE } from '../../utils/wordHandler';

export default function BanDaiDienPHHS() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    ho_ten_ph: '', phu_huynh_em: '', chuc_vu: 'Trưởng ban', so_dien_thoai: '', dia_chi: ''
  });

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/phuhuynh`);
      if (res.ok) {
        const data = await res.json();
        setList(data);
        return;
      }
    } catch {}
    const local = localStorage.getItem('tbl_phuhuynh');
    if (local) setList(JSON.parse(local));
  };

  useEffect(() => { fetchList(); }, []);

  const saveLocal = (data) => {
    setList(data);
    localStorage.setItem('tbl_phuhuynh', JSON.stringify(data));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.ho_ten_ph.trim()) return;

    const newObj = { ...form, stt: list.length + 1 };
    try {
      const res = await fetch(`${API_BASE}/phuhuynh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObj)
      });
      if (res.ok) {
        fetchList();
        setForm({ ho_ten_ph: '', phu_huynh_em: '', chuc_vu: 'Trưởng ban', so_dien_thoai: '', dia_chi: '' });
        return;
      }
    } catch {}
    saveLocal([...list, { id: Date.now(), ...newObj }]);
    setForm({ ho_ten_ph: '', phu_huynh_em: '', chuc_vu: 'Trưởng ban', so_dien_thoai: '', dia_chi: '' });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/phuhuynh/${id}`, { method: 'DELETE' });
    } catch {}
    saveLocal(list.filter(item => item.id !== id));
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rows = await parseDocxTable(file);
      const dataRows = (rows[0] && (rows[0][0]?.toLowerCase().includes('stt') || rows[0][1]?.toLowerCase().includes('họ')))
        ? rows.slice(1)
        : rows;

      const parsed = dataRows.map((r, i) => ({
        stt: parseInt(r[0]) || (i + 1),
        ho_ten_ph: r[1] || '',
        phu_huynh_em: r[2] || '',
        chuc_vu: r[3] || 'Thành viên',
        so_dien_thoai: r[4] || '',
        dia_chi: r[5] || ''
      })).filter(x => x.ho_ten_ph);

      try {
        await fetch(`${API_BASE}/phuhuynh/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        fetchList();
      } catch {
        saveLocal([...list, ...parsed]);
      }
    } catch (err) {
      alert('Không đọc được bảng từ file Word. Hãy đảm bảo file có chứa Table!');
    }
  };

  const handleExportWord = () => {
    exportDocxTable({
      filename: 'Ban_Dai_Dien_PHHS',
      title: 'DANH SÁCH BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH',
      headers: ['STT', 'Họ và tên PHHS', 'Phụ huynh của em', 'Chức vụ', 'Số điện thoại', 'Địa chỉ'],
      rows: list.map((item, idx) => [
        idx + 1, item.ho_ten_ph, item.phu_huynh_em, item.chuc_vu, item.so_dien_thoai, item.dia_chi
      ])
    });
  };

  return (
    <ModuleContainer title="BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH" desc="Hỗ trợ nhập Word, xuất Word, thêm & xóa phụ huynh (Đồng bộ MySQL)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-4 h-4" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-4 bg-slate-950/40 border border-slate-800 rounded-xl mb-4 text-xs">
        <input type="text" required placeholder="Họ và tên PHHS..." value={form.ho_ten_ph} onChange={e => setForm({ ...form, ho_ten_ph: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white md:col-span-2 focus:border-cyan-500 outline-none" />
        <input type="text" placeholder="Phụ huynh của em..." value={form.phu_huynh_em} onChange={e => setForm({ ...form, phu_huynh_em: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none" />
        <select value={form.chuc_vu} onChange={e => setForm({ ...form, chuc_vu: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none">
          <option value="Trưởng ban">Trưởng ban</option>
          <option value="Phó ban">Phó ban</option>
          <option value="Ủy viên">Ủy viên</option>
          <option value="Thành viên">Thành viên</option>
        </select>
        <input type="text" placeholder="Số điện thoại..." value={form.so_dien_thoai} onChange={e => setForm({ ...form, so_dien_thoai: e.target.value })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none" />
        <button type="submit" className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-1 transition">
          <Plus className="w-4 h-4" /> Thêm PHHS
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-3">STT</th>
              <th className="p-3">Họ và tên PHHS</th>
              <th className="p-3">Phụ huynh em</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3 text-right">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {list.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-500">Chưa có dữ liệu</td></tr>
            ) : (
              list.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-3 font-semibold text-white">{item.ho_ten_ph}</td>
                  <td className="p-3 text-slate-400">{item.phu_huynh_em || '-'}</td>
                  <td className="p-3 text-cyan-400">{item.chuc_vu}</td>
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