import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, HeartHandshake, UserCheck, School, 
  Calendar, TrendingUp, AlertOctagon, ClipboardList, 
  CheckCircle2, Award, Snowflake, CheckCheck,
  Upload, Download, Plus, Trash2, Edit2, Check, X, RefreshCw
} from 'lucide-react';
import ModuleContainer from '../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../utils/wordHandler';

// =========================================================================
// PHÂN HỆ 1: TỔ CHỨC & HỒ SƠ LỚP (4 MODULES)
// =========================================================================

// 1. SƠ YẾU LÝ LỊCH HỌC SINH (KẾT NỐI TRỰC TIẾP MYSQL + EXCEL BATCH THEO LỚP)
export function LyLichHocSinh({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    ho_ten: '',
    ngay_sinh: '',
    gioi_tinh: 'Nam',
    ho_ten_ph: '',
    so_dien_thoai: '',
    dia_chi: '',
    to_so: 1,
    chuc_vu_to: 'Thành viên'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/soyeulylich?ma_lop=${encodeURIComponent(currentLop)}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách sơ yếu lý lịch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentLop]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!form.ho_ten.trim()) return;
    try {
      const res = await fetch('/api/soyeulylich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ma_lop: currentLop })
      });
      if (res.ok) {
        setForm({
          ho_ten: '',
          ngay_sinh: '',
          gioi_tinh: 'Nam',
          ho_ten_ph: '',
          so_dien_thoai: '',
          dia_chi: '',
          to_so: 1,
          chuc_vu_to: 'Thành viên'
        });
        loadData();
      }
    } catch (err) {
      alert('Lỗi thêm học sinh: ' + err.message);
    }
  };

  const handleUpdateStudent = async (id) => {
    try {
      const res = await fetch(`/api/soyeulylich/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingId(null);
        loadData();
      }
    } catch (err) {
      alert('Lỗi cập nhật học sinh: ' + err.message);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Xác nhận xóa hồ sơ học sinh "${name}" khỏi cơ sở dữ liệu lớp ${currentLop}?`)) return;
    try {
      const res = await fetch(`/api/soyeulylich/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      alert('Lỗi xóa học sinh: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(`CẢNH BÁO: Thao tác này sẽ XÓA TOÀN BỘ học sinh của LỚP ${currentLop} trên MySQL. Các lớp khác sẽ KHÔNG bị ảnh hưởng. Bạn có chắc chắn không?`)) return;
    try {
      const res = await fetch(`/api/soyeulylich?ma_lop=${encodeURIComponent(currentLop)}`, { method: 'DELETE' });
      if (res.ok) {
        setStudents([]);
        setFileName('');
        loadData();
      }
    } catch (err) {
      alert('Lỗi dọn sạch bảng: ' + err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (data && data.length > 1) {
          setLoading(true);
          const contentRows = data.slice(1).filter(r => r && r.some(c => c !== undefined && c !== null && c !== ''));

          // Phân tích các hàng Excel thành đối tượng học sinh
          const parsed = contentRows.map(r => {
            const ho_ten = String(r[1] || r[0] || '').trim();
            return {
              ho_ten,
              ngay_sinh: String(r[2] || '').trim(),
              gioi_tinh: String(r[3] || 'Nam').trim(),
              ho_ten_ph: String(r[4] || '').trim(),
              so_dien_thoai: String(r[5] || '').trim(),
              dia_chi: String(r[6] || '').trim(),
              to_so: Number(r[7]) || 1,
              chuc_vu_to: String(r[8] || 'Thành viên').trim(),
              ma_lop: currentLop
            };
          }).filter(s => s.ho_ten && s.ho_ten.length > 1 && !s.ho_ten.toLowerCase().includes('họ và tên'));

          if (parsed.length > 0) {
            const res = await fetch('/api/soyeulylich/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ students: parsed, ma_lop: currentLop })
            });
            if (res.ok) {
              alert(`Nhập thành công ${parsed.length} học sinh cho lớp ${currentLop} từ file Excel vào MySQL!`);
              loadData();
            } else {
              alert('Máy chủ báo lỗi khi lưu hàng loạt vào MySQL.');
            }
          }
        }
      } catch (err) {
        alert('Lỗi đọc file Excel: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleExportExcel = () => {
    if (students.length === 0) return;
    const worksheetData = [
      ['STT', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Họ tên Cha/Mẹ', 'Số điện thoại', 'Địa chỉ', 'Tổ số', 'Chức vụ trong tổ'],
      ...students.map((s, idx) => [
        idx + 1,
        s.ho_ten,
        s.ngay_sinh,
        s.gioi_tinh,
        s.ho_ten_ph,
        s.so_dien_thoai,
        s.dia_chi,
        `Tổ ${s.to_so || 1}`,
        s.chuc_vu_to || 'Thành viên'
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");
    XLSX.writeFile(wb, "So_Yeu_Ly_Lich_Hoc_Sinh.xlsx");
  };

  return (
    <ModuleContainer title="SƠ YẾU LÝ LỊCH HỌC SINH" desc="Hồ sơ gốc của học sinh cả lớp • Đồng bộ trực tiếp MySQL • Hỗ trợ Excel (.xlsx, .xls)">
      {/* THANH CÔNG CỤ NHẬP / XUẤT */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-sm">
            <Upload className="w-4 h-4" />
            <span>Tải lên file Excel (.xlsx, .xls)</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportExcel}
            disabled={students.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          {fileName && (
            <span className="text-xs text-cyan-400 font-mono">
              Tệp vừa tải: <b>{fileName}</b>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400">
            Sĩ số: <b className="text-cyan-400">{students.length}</b> em
          </span>
          {students.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-1.5 border border-red-500/20 transition"
              title="Xóa toàn bộ danh sách khỏi cơ sở dữ liệu"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ</span>
            </button>
          )}
        </div>
      </div>

      {/* FORM NHẬP NHANH TỪNG HỌC SINH VÀO MYSQL */}
      <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input 
          placeholder="Họ và tên *" 
          value={form.ho_ten} 
          onChange={e => setForm({ ...form, ho_ten: e.target.value })} 
          className="lg:col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" 
          required 
        />
        <input 
          placeholder="Ngày sinh (dd/mm/yyyy)" 
          value={form.ngay_sinh} 
          onChange={e => setForm({ ...form, ngay_sinh: e.target.value })} 
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" 
        />
        <select 
          value={form.gioi_tinh} 
          onChange={e => setForm({ ...form, gioi_tinh: e.target.value })} 
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
        <input 
          placeholder="Họ tên Cha/Mẹ" 
          value={form.ho_ten_ph} 
          onChange={e => setForm({ ...form, ho_ten_ph: e.target.value })} 
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" 
        />
        <input 
          placeholder="Số điện thoại" 
          value={form.so_dien_thoai} 
          onChange={e => setForm({ ...form, so_dien_thoai: e.target.value })} 
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" 
        />
        <select 
          value={form.to_so} 
          onChange={e => setForm({ ...form, to_so: Number(e.target.value) })} 
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value={1}>Tổ 1</option>
          <option value={2}>Tổ 2</option>
          <option value={3}>Tổ 3</option>
          <option value={4}>Tổ 4</option>
        </select>
        <button 
          type="submit" 
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow transition"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm vào DB
        </button>
      </form>

      {/* HIỂN THỊ DANH SÁCH TỪ MYSQL */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Đang tải dữ liệu hồ sơ học sinh từ cơ sở dữ liệu MySQL...
        </div>
      ) : students.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Chưa có dữ liệu học sinh trong cơ sở dữ liệu</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tải lên file Excel (.xlsx, .xls) hoặc nhập nhanh ở biểu mẫu trên để lưu trực tiếp vào MySQL.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[520px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-800/95 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-3 text-center w-12">STT</th>
                <th className="p-3">Họ và tên</th>
                <th className="p-3">Ngày sinh</th>
                <th className="p-3">Giới tính</th>
                <th className="p-3">Họ tên Cha/Mẹ</th>
                <th className="p-3">SĐT Liên hệ</th>
                <th className="p-3">Tổ</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((st, idx) => {
                const isEdit = editingId === st.id;
                return (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition">
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
                            value={editForm.ngay_sinh || ''} 
                            onChange={e => setEditForm({ ...editForm, ngay_sinh: e.target.value })} 
                            className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" 
                          />
                        </td>
                        <td className="p-2">
                          <select 
                            value={editForm.gioi_tinh || 'Nam'} 
                            onChange={e => setEditForm({ ...editForm, gioi_tinh: e.target.value })} 
                            className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                          >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input 
                            value={editForm.ho_ten_ph || ''} 
                            onChange={e => setEditForm({ ...editForm, ho_ten_ph: e.target.value })} 
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
                          <select 
                            value={editForm.to_so || 1} 
                            onChange={e => setEditForm({ ...editForm, to_so: Number(e.target.value) })} 
                            className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white"
                          >
                            <option value={1}>Tổ 1</option>
                            <option value={2}>Tổ 2</option>
                            <option value={3}>Tổ 3</option>
                            <option value={4}>Tổ 4</option>
                          </select>
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleUpdateStudent(st.id)} className="p-1 bg-emerald-600 text-white rounded">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-semibold text-white">{st.ho_ten}</td>
                        <td className="p-3 text-slate-400">{st.ngay_sinh || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.gioi_tinh === 'Nữ' ? 'bg-pink-500/15 text-pink-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
                            {st.gioi_tinh || 'Nam'}
                          </span>
                        </td>
                        <td className="p-3">{st.ho_ten_ph || '-'}</td>
                        <td className="p-3 font-mono text-slate-400">{st.so_dien_thoai || '-'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                            Tổ {st.to_so || 1}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setEditingId(st.id); setEditForm(st); }} 
                              className="text-cyan-400 hover:text-cyan-300"
                              title="Sửa thông tin"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(st.id, st.ho_ten)} 
                              className="text-red-400 hover:text-red-300"
                              title="Xóa học sinh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ModuleContainer>
  );
}

// 2. BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH (WORD .DOCX + CRUD)
export function BanDaiDienPHHS({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ ho_ten_ph: '', phu_huynh_em: '', chuc_vu: 'Thành viên', so_dien_thoai: '', dia_chi: '' });

  const loadData = () => {
    fetch(`/api/phuhuynh?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.ho_ten_ph.trim()) return;
    await fetch('/api/phuhuynh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
    });
    setForm({ ho_ten_ph: '', phu_huynh_em: '', chuc_vu: 'Thành viên', so_dien_thoai: '', dia_chi: '' });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`/api/phuhuynh/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa phụ huynh này?')) return;
    await fetch(`/api/phuhuynh/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        await fetch('/api/phuhuynh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ho_ten_ph: parts[0],
            phu_huynh_em: parts[1] || '',
            chuc_vu: parts[2] || 'Thành viên',
            so_dien_thoai: parts[3] || '',
            dia_chi: parts[4] || '',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'DANH SÁCH BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH',
      headers: ['STT', 'Họ và tên PHHS', 'Phụ huynh của em', 'Chức vụ', 'Số điện thoại', 'Địa chỉ'],
      rows: list.map((item, idx) => [idx + 1, item.ho_ten_ph, item.phu_huynh_em, item.chuc_vu, item.so_dien_thoai, item.dia_chi]),
      filename: 'Ban_Dai_Dien_PHHS'
    });
  };

  return (
    <ModuleContainer title="BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH" desc={`Quản lý Ban đại diện PHHS lớp ${currentLop} (Nhập / Xuất Word .docx)`}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input placeholder="Họ tên PHHS *" value={form.ho_ten_ph} onChange={e => setForm({ ...form, ho_ten_ph: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input placeholder="PH em..." value={form.phu_huynh_em} onChange={e => setForm({ ...form, phu_huynh_em: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Chức vụ" value={form.chuc_vu} onChange={e => setForm({ ...form, chuc_vu: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Số điện thoại" value={form.so_dien_thoai} onChange={e => setForm({ ...form, so_dien_thoai: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Địa chỉ" value={form.dia_chi} onChange={e => setForm({ ...form, dia_chi: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
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
                      <td className="p-2"><input value={editForm.ho_ten_ph || ''} onChange={e => setEditForm({ ...editForm, ho_ten_ph: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.phu_huynh_em || ''} onChange={e => setEditForm({ ...editForm, phu_huynh_em: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.chuc_vu || ''} onChange={e => setEditForm({ ...editForm, chuc_vu: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.so_dien_thoai || ''} onChange={e => setEditForm({ ...editForm, so_dien_thoai: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.dia_chi || ''} onChange={e => setEditForm({ ...editForm, dia_chi: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
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
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold text-[10px]">{it.chuc_vu}</span></td>
                      <td className="p-3">{it.so_dien_thoai || '-'}</td>
                      <td className="p-3">{it.dia_chi || '-'}</td>
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
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Chưa có thông tin ban đại diện cha mẹ học sinh</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}

// 3. CÁN BỘ ĐOÀN & CÁN BỘ LỚP (WORD .DOCX + CRUD)
export function CanBoLopDoan({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ chuc_vu: '', ho_ten: '', nhiem_vu: '', so_dien_thoai: '', loai_can_bo: 'LOP' });

  const loadData = () => {
    fetch(`/api/canbo?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.ho_ten.trim() || !form.chuc_vu.trim()) return;
    await fetch('/api/canbo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
    });
    setForm({ chuc_vu: '', ho_ten: '', nhiem_vu: '', so_dien_thoai: '', loai_can_bo: 'LOP' });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`/api/canbo/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa cán bộ này?')) return;
    await fetch(`/api/canbo/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch('/api/canbo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loai_can_bo: parts[0].toUpperCase().includes('ĐOÀN') ? 'DOAN' : 'LOP',
            chuc_vu: parts[1] || 'Cán bộ',
            ho_ten: parts[2] || parts[0],
            nhiem_vu: parts[3] || '',
            so_dien_thoai: parts[4] || '',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: 'DANH SÁCH CÁN BỘ LỚP VÀ CÁN BỘ ĐOÀN',
      headers: ['STT', 'Tổ chức', 'Chức vụ', 'Họ và tên', 'Nhiệm vụ', 'SĐT'],
      rows: list.map((it, idx) => [idx + 1, it.loai_can_bo === 'DOAN' ? 'Chi Đoàn' : 'Ban Cán Sự', it.chuc_vu, it.ho_ten, it.nhiem_vu, it.so_dien_thoai]),
      filename: 'Can_Bo_Lop_Doan'
    });
  };

  return (
    <ModuleContainer title="DANH SÁCH CÁN BỘ LỚP & CÁN BỘ ĐOÀN" desc="Quản lý Ban cán sự lớp và Chi đoàn (Nhập / Xuất Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <select value={form.loai_can_bo} onChange={e => setForm({ ...form, loai_can_bo: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
          <option value="LOP">Ban Cán Sự Lớp</option>
          <option value="DOAN">BCH Chi Đoàn</option>
        </select>
        <input placeholder="Chức vụ *" value={form.chuc_vu} onChange={e => setForm({ ...form, chuc_vu: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input placeholder="Họ và tên *" value={form.ho_ten} onChange={e => setForm({ ...form, ho_ten: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input placeholder="Nhiệm vụ" value={form.nhiem_vu} onChange={e => setForm({ ...form, nhiem_vu: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Số điện thoại" value={form.so_dien_thoai} onChange={e => setForm({ ...form, so_dien_thoai: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm Cán Bộ
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Tổ chức</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3">Nhiệm vụ phụ trách</th>
              <th className="p-3">SĐT</th>
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
                        <select value={editForm.loai_can_bo} onChange={e => setEditForm({ ...editForm, loai_can_bo: e.target.value })} className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white">
                          <option value="LOP">Ban Cán Sự</option>
                          <option value="DOAN">Chi Đoàn</option>
                        </select>
                      </td>
                      <td className="p-2"><input value={editForm.chuc_vu || ''} onChange={e => setEditForm({ ...editForm, chuc_vu: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.ho_ten || ''} onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.nhiem_vu || ''} onChange={e => setEditForm({ ...editForm, nhiem_vu: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.so_dien_thoai || ''} onChange={e => setEditForm({ ...editForm, so_dien_thoai: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleUpdate(it.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${it.loai_can_bo === 'DOAN' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                          {it.loai_can_bo === 'DOAN' ? 'Chi Đoàn' : 'Ban Cán Sự'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-white">{it.chuc_vu}</td>
                      <td className="p-3">{it.ho_ten}</td>
                      <td className="p-3">{it.nhiem_vu || '-'}</td>
                      <td className="p-3">{it.so_dien_thoai || '-'}</td>
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
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Chưa có danh sách cán bộ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}

// 4. SƠ ĐỒ LỚP HỌC & CHIA TỔ (DÙNG CHUNG BẢNG HỌC SINH VỚI SƠ YẾU LÝ LỊCH)
export function SoDoLopHoc({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [students, setStudents] = useState([]);
  const [toSo, setToSo] = useState(1);
  const [hoTen, setHoTen] = useState('');
  const [chucVu, setChucVu] = useState('Thành viên');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadData = async () => {
    try {
      const res = await fetch(`/api/soyeulylich?ma_lop=${encodeURIComponent(currentLop)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data);
          return;
        }
      }
      // Fallback nếu soyeulylich rỗng
      const res2 = await fetch(`/api/to-hocsinh?ma_lop=${encodeURIComponent(currentLop)}`);
      if (res2.ok) {
        const data2 = await res2.json();
        setStudents(Array.isArray(data2) ? data2 : []);
      } else {
        setStudents([]);
      }
    } catch (e) {
      console.error('Lỗi tải danh sách chia tổ:', e);
    }
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleAddHS = async (e) => {
    e.preventDefault();
    if (!hoTen.trim()) return;
    try {
      await fetch('/api/soyeulylich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ho_ten: hoTen.trim(), to_so: toSo, chuc_vu_to: chucVu, ma_lop: currentLop })
      });
      setHoTen('');
      loadData();
    } catch (err) {
      alert('Lỗi thêm học sinh vào tổ: ' + err.message);
    }
  };

  const handleUpdateHS = async (id) => {
    try {
      await fetch(`/api/soyeulylich/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      setEditingId(null);
      loadData();
    } catch (err) {
      alert('Lỗi cập nhật tổ: ' + err.message);
    }
  };

  const handleDeleteHS = async (id) => {
    if (!window.confirm('Xác nhận xóa học sinh này khỏi danh sách?')) return;
    try {
      await fetch(`/api/soyeulylich/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Lỗi xóa học sinh: ' + err.message);
    }
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch('/api/soyeulylich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_so: parseInt(parts[0]) || 1,
            ho_ten: parts[1],
            chuc_vu_to: parts[2] || 'Thành viên',
            ghi_chu: parts[3] || '',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `DANH SÁCH HỌC SINH THEO TỔ - LỚP ${currentLop}`,
      headers: ['STT', 'Tổ số', 'Họ và tên học sinh', 'Chức vụ trong tổ', 'Ghi chú'],
      rows: students.map((it, idx) => [idx + 1, `Tổ ${it.to_so || 1}`, it.ho_ten, it.chuc_vu_to || 'Thành viên', it.ghi_chu || '']),
      filename: `Danh_Sach_Chia_To_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="DANH SÁCH CHIA TỔ & SƠ ĐỒ LỚP" desc="Quản lý chia tổ lớp học • Đồng bộ chung với Sơ yếu lý lịch • Hỗ trợ Word .docx">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={students.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          Tổng số: <b className="text-cyan-400">{students.length}</b> HS trong các tổ
        </span>
      </div>

      <form onSubmit={handleAddHS} className="flex flex-wrap gap-2 mb-6 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <select value={toSo} onChange={e => setToSo(Number(e.target.value))} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
          {[1, 2, 3, 4].map(t => <option key={t} value={t}>Tổ {t}</option>)}
        </select>
        <input 
          list="so-do-datalist"
          placeholder="Họ và tên học sinh (nhập hoặc chọn danh sách) *" 
          value={hoTen} 
          onChange={e => setHoTen(e.target.value)} 
          className="flex-1 min-w-[200px] px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" 
          required 
        />
        <datalist id="so-do-datalist">
          {students.map(s => <option key={s.id} value={s.ho_ten} />)}
        </datalist>
        <input placeholder="Chức vụ (Tổ trưởng/Tổ phó/Thành viên)" value={chucVu} onChange={e => setChucVu(e.target.value)} className="w-48 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <button type="submit" className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm vào tổ
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(t => {
          const group = students.filter(s => s.to_so === t);
          return (
            <div key={t} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                <h4 className="font-bold text-cyan-400 text-xs uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Tổ {t}
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">{group.length} HS</span>
              </div>
              <ul className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {group.map((st, idx) => {
                  const isEdit = editingId === st.id;
                  return (
                    <li key={st.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs">
                      {isEdit ? (
                        <div className="space-y-1.5">
                          <input value={editForm.ho_ten || ''} onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })} className="w-full px-1.5 py-1 bg-slate-950 border border-cyan-500/50 rounded text-xs text-white" />
                          <div className="flex gap-1">
                            <select value={editForm.to_so || t} onChange={e => setEditForm({ ...editForm, to_so: Number(e.target.value) })} className="px-1 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-white">
                              {[1, 2, 3, 4].map(n => <option key={n} value={n}>Tổ {n}</option>)}
                            </select>
                            <input value={editForm.chuc_vu_to || ''} onChange={e => setEditForm({ ...editForm, chuc_vu_to: e.target.value })} className="flex-1 px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-white" />
                          </div>
                          <div className="flex justify-end gap-1 pt-1">
                            <button onClick={() => handleUpdateHS(st.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3 h-3" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">{idx + 1}. {st.ho_ten}</div>
                            <div className="text-[10px] text-cyan-400/80">{st.chuc_vu_to}</div>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => { setEditingId(st.id); setEditForm(st); }} className="text-cyan-400 hover:text-cyan-300"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteHS(st.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
                {group.length === 0 && <li className="text-[11px] text-slate-600 italic py-6 text-center">Chưa có học sinh</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </ModuleContainer>
  );
}

// =========================================================================
// PHÂN HỆ 2: NỀ NẾP & HỌC TẬP (4 MODULES)
// =========================================================================

// 5. THỜI KHÓA BIỂU 2 BUỔI (WORD .DOCX + CRUD)
export function ThoiKhoaBieu({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [schedule, setSchedule] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [newRow, setNewRow] = useState({ buoi: 'SANG', tiet: 1, thu_2: '', thu_3: '', thu_4: '', thu_5: '', thu_6: '', thu_7: '' });

  const loadData = () => {
    fetch('/api/tkb/init', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ma_lop: currentLop })
    }).then(() => {
      fetch(`/api/tkb?ma_lop=${encodeURIComponent(currentLop)}`)
        .then(r => r.json())
        .then(data => setSchedule(Array.isArray(data) ? data : []))
        .catch(console.error);
    });
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    await fetch('/api/tkb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRow, ma_lop: currentLop })
    });
    setNewRow({ buoi: 'SANG', tiet: schedule.length + 1, thu_2: '', thu_3: '', thu_4: '', thu_5: '', thu_6: '', thu_7: '' });
    loadData();
  };

  const handleSaveEdit = async (id) => {
    await fetch(`/api/tkb/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editRow)
    });
    setEditingId(null);
    loadData();
  };

  const handleDeletePeriod = async (id) => {
    if (!window.confirm('Xác nhận xóa tiết học này?')) return;
    await fetch(`/api/tkb/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch('/api/tkb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buoi: parts[0]?.toUpperCase().includes('CHIỀU') ? 'CHIEU' : 'SANG',
            tiet: parseInt(parts[1]) || 1,
            thu_2: parts[2] || '',
            thu_3: parts[3] || '',
            thu_4: parts[4] || '',
            thu_5: parts[5] || '',
            thu_6: parts[6] || '',
            thu_7: parts[7] || '',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `THỜI KHÓA BIỂU LỚP ${currentLop}`,
      headers: ['Buổi', 'Tiết', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
      rows: schedule.map(row => [row.buoi === 'SANG' ? 'Sáng' : 'Chiều', `Tiết ${row.tiet}`, row.thu_2, row.thu_3, row.thu_4, row.thu_5, row.thu_6, row.thu_7]),
      filename: `Thoi_Khoa_Bieu_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="THỜI KHÓA BIỂU 2 BUỔI" desc="Thêm tiết, sửa môn học trực tiếp, xóa tiết và Nhập / Xuất Word (.docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={schedule.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreatePeriod} className="flex flex-wrap gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800 items-center">
        <select value={newRow.buoi} onChange={e => setNewRow({ ...newRow, buoi: e.target.value })} className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
          <option value="SANG">Buổi Sáng</option>
          <option value="CHIEU">Buổi Chiều</option>
        </select>
        <input type="number" min="1" max="10" value={newRow.tiet} onChange={e => setNewRow({ ...newRow, tiet: parseInt(e.target.value) || 1 })} placeholder="Tiết số" className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        {['thu_2', 'thu_3', 'thu_4', 'thu_5', 'thu_6', 'thu_7'].map((d, i) => (
          <input key={d} placeholder={`Thứ ${i + 2}`} value={newRow[d]} onChange={e => setNewRow({ ...newRow, [d]: e.target.value })} className="w-20 lg:w-24 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white text-center" />
        ))}
        <button type="submit" className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 ml-auto">
          <Plus className="w-3.5 h-3.5" /> Thêm tiết
        </button>
      </form>

      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-center text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-16">Buổi</th>
              <th className="p-3 w-16">Tiết</th>
              <th>Thứ 2</th><th>Thứ 3</th><th>Thứ 4</th><th>Thứ 5</th><th>Thứ 6</th><th>Thứ 7</th>
              <th className="p-3 w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {schedule.map(row => {
              const isEdit = editingId === row.id;
              return (
                <tr key={row.id} className="hover:bg-slate-800/40">
                  <td className="p-2 font-bold text-cyan-400">{row.buoi === 'SANG' ? 'Sáng' : 'Chiều'}</td>
                  <td className="p-2 text-slate-400 font-mono">Tiết {row.tiet}</td>
                  {['thu_2', 'thu_3', 'thu_4', 'thu_5', 'thu_6', 'thu_7'].map(thu => (
                    <td key={thu} className="p-1">
                      {isEdit ? (
                        <input value={editRow[thu] ?? ''} onChange={e => setEditRow({ ...editRow, [thu]: e.target.value })} className="w-full min-w-[70px] px-1.5 py-1 bg-slate-950 border border-cyan-500/50 rounded text-center text-xs text-white" />
                      ) : (
                        <span className={row[thu] ? 'font-medium text-white' : 'text-slate-600'}>{row[thu] || '-'}</span>
                      )}
                    </td>
                  ))}
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {isEdit ? (
                        <>
                          <button onClick={() => handleSaveEdit(row.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 bg-slate-700 text-slate-300 rounded"><X className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(row.id); setEditRow(row); }} className="text-cyan-400 hover:text-cyan-300 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeletePeriod(row.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}

// 6. THEO DÕI HỌC TẬP & RÈN LUYỆN (WORD .DOCX + CRUD)
export function TheoDoiHocTap({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [list, setList] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
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
    fetch(`/api/theodoi?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`/api/soyeulylich?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setStudentOptions(data); })
      .catch(() => {});
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.ho_ten.trim()) return;
    await fetch('/api/theodoi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
    });
    setForm({ ngay_thang: new Date().toISOString().slice(0, 10), ho_ten: '', mon_hoc: '', diem_nhan_xet: '', vi_pham_khen_thuong: '' });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`/api/theodoi/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa bản ghi theo dõi này?')) return;
    await fetch(`/api/theodoi/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch('/api/theodoi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ngay_thang: parts[0] || new Date().toISOString().slice(0, 10),
            ho_ten: parts[1],
            mon_hoc: parts[2] || '',
            diem_nhan_xet: parts[3] || '',
            vi_pham_khen_thuong: parts[4] || '',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `SỔ THEO DÕI HỌC TẬP VÀ RÈN LUYỆN - LỚP ${currentLop}`,
      headers: ['STT', 'Ngày', 'Họ và tên học sinh', 'Môn học', 'Điểm / Nhận xét', 'Vi phạm / Khen thưởng'],
      rows: list.map((it, idx) => [idx + 1, it.ngay_thang ? String(it.ngay_thang).slice(0, 10) : '', it.ho_ten, it.mon_hoc, it.diem_nhan_xet, it.vi_pham_khen_thuong]),
      filename: `Theo_Doi_Hoc_Tap_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="THEO DÕI HỌC TẬP & RÈN LUYỆN" desc="Nhật ký nề nếp, điểm số hàng ngày (Nhập / Xuất Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input type="date" value={form.ngay_thang} onChange={e => setForm({ ...form, ngay_thang: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input 
          list="theodoi-students-list"
          placeholder="Họ và tên *" 
          value={form.ho_ten} 
          onChange={e => setForm({ ...form, ho_ten: e.target.value })} 
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" 
          required 
        />
        <datalist id="theodoi-students-list">
          {studentOptions.map(s => <option key={s.id} value={s.ho_ten} />)}
        </datalist>
        <input placeholder="Môn học" value={form.mon_hoc} onChange={e => setForm({ ...form, mon_hoc: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Điểm / Nhận xét" value={form.diem_nhan_xet} onChange={e => setForm({ ...form, diem_nhan_xet: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Vi phạm / Khen thưởng" value={form.vi_pham_khen_thuong} onChange={e => setForm({ ...form, vi_pham_khen_thuong: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
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
                      <td className="p-2"><input type="date" value={editForm.ngay_thang ? String(editForm.ngay_thang).slice(0, 10) : ''} onChange={e => setEditForm({ ...editForm, ngay_thang: e.target.value })} className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input list="theodoi-students-list" value={editForm.ho_ten || ''} onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.mon_hoc || ''} onChange={e => setEditForm({ ...editForm, mon_hoc: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.diem_nhan_xet || ''} onChange={e => setEditForm({ ...editForm, diem_nhan_xet: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.vi_pham_khen_thuong || ''} onChange={e => setEditForm({ ...editForm, vi_pham_khen_thuong: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
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
                      <td className="p-3"><span className={it.vi_pham_khen_thuong?.toLowerCase().includes('khen') ? 'text-emerald-400' : 'text-amber-400'}>{it.vi_pham_khen_thuong || '-'}</span></td>
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
              <tr><td colSpan="7" className="py-8 text-center text-slate-500">Chưa có nhật ký theo dõi học tập</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}

// 7. GIÁO DỤC HỌC SINH CÁ BIỆT (WORD .DOCX + CRUD)
export function GiaoDucCaBiet({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [list, setList] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ ho_ten: '', bieu_hien: '', bien_phap: '', xac_nhan_ph: 'Chưa ký' });

  const loadData = () => {
    fetch(`/api/cabiet?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`/api/soyeulylich?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setStudentOptions(data); })
      .catch(() => {});
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.ho_ten.trim()) return;
    await fetch('/api/cabiet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
    });
    setForm({ ho_ten: '', bieu_hien: '', bien_phap: '', xac_nhan_ph: 'Chưa ký' });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`/api/cabiet/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa hồ sơ theo dõi học sinh này?')) return;
    await fetch(`/api/cabiet/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        await fetch('/api/cabiet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ho_ten: parts[0],
            bieu_hien: parts[1] || '',
            bien_phap: parts[2] || '',
            xac_nhan_ph: parts[3] || 'Chưa ký',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `KẾ HOẠCH GIÁO DỤC HỌC SINH CÁ BIỆT - LỚP ${currentLop}`,
      headers: ['STT', 'Họ và tên học sinh', 'Biểu hiện cụ thể', 'Biện pháp giáo dục', 'Xác nhận của PHHS'],
      rows: list.map((it, idx) => [idx + 1, it.ho_ten, it.bieu_hien, it.bien_phap, it.xac_nhan_ph]),
      filename: `Giao_Duc_Ca_Biet_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="HỒ SƠ GIÁO DỤC HỌC SINH CÁ BIỆT" desc="Kế hoạch uốn nắn, phối hợp với phụ huynh (Nhập / Xuất Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input 
          list="cabiet-students-list"
          placeholder="Họ và tên học sinh *" 
          value={form.ho_ten} 
          onChange={e => setForm({ ...form, ho_ten: e.target.value })} 
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" 
          required 
        />
        <datalist id="cabiet-students-list">
          {studentOptions.map(s => <option key={s.id} value={s.ho_ten} />)}
        </datalist>
        <input placeholder="Biểu hiện vi phạm" value={form.bieu_hien} onChange={e => setForm({ ...form, bieu_hien: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Biện pháp GVCN" value={form.bien_phap} onChange={e => setForm({ ...form, bien_phap: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <select value={form.xac_nhan_ph} onChange={e => setForm({ ...form, xac_nhan_ph: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
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
                      <td className="p-2"><input list="cabiet-students-list" value={editForm.ho_ten || ''} onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.bieu_hien || ''} onChange={e => setEditForm({ ...editForm, bieu_hien: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2"><input value={editForm.bien_phap || ''} onChange={e => setEditForm({ ...editForm, bien_phap: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
                      <td className="p-2">
                        <select value={editForm.xac_nhan_ph || 'Chưa ký'} onChange={e => setEditForm({ ...editForm, xac_nhan_ph: e.target.value })} className="px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white">
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
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${it.xac_nhan_ph === 'Đã ký cam kết' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{it.xac_nhan_ph || 'Chưa ký'}</span></td>
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
              <tr><td colSpan="6" className="py-8 text-center text-slate-500">Không có học sinh trong diện theo dõi đặc biệt</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}

// 8. NỘI DUNG SINH HOẠT LỚP (WORD .DOCX + CRUD)
export function SinhHoatLop({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
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
    fetch(`/api/sinhhoat?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('/api/sinhhoat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
    });
    setForm({ tuan: (parseInt(form.tuan) || 0) + 1, ngay_hop: new Date().toISOString().slice(0, 10), danh_gia: '', phuong_huong: '', tuyen_duong: '' });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`/api/sinhhoat/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa biên bản tuần này?')) return;
    await fetch(`/api/sinhhoat/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch('/api/sinhhoat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tuan: parseInt(parts[0]) || 1,
            ngay_hop: parts[1] || new Date().toISOString().slice(0, 10),
            danh_gia: parts[2] || '',
            phuong_huong: parts[3] || '',
            tuyen_duong: parts[4] || '',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `BIÊN BẢN & NỘI DUNG SINH HOẠT LỚP HÀNG TUẦN - LỚP ${currentLop}`,
      headers: ['Tuần', 'Ngày họp', 'Đánh giá hoạt động tuần qua', 'Phương hướng kế hoạch tuần tới', 'Tuyên dương'],
      rows: list.map(it => [`Tuần ${it.tuan}`, it.ngay_hop ? String(it.ngay_hop).slice(0, 10) : '', it.danh_gia, it.phuong_huong, it.tuyen_duong]),
      filename: `Bien_Ban_Sinh_Hoat_Lop_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="NỘI DUNG & BIÊN BẢN SINH HOẠT LỚP" desc="Lập biên bản sinh hoạt Thứ 7, đánh giá nề nếp và phương hướng tuần (Nhập / Xuất Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 mb-6 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Tuần số</label>
            <input type="number" min="1" value={form.tuan} onChange={e => setForm({ ...form, tuan: parseInt(e.target.value) || 1 })} className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Ngày sinh hoạt</label>
            <input type="date" value={form.ngay_hop} onChange={e => setForm({ ...form, ngay_hop: e.target.value })} className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Tuyên dương cá nhân / tổ</label>
            <input placeholder="VD: Tổ 1, em Nguyễn Văn A..." value={form.tuyen_duong} onChange={e => setForm({ ...form, tuyen_duong: e.target.value })} className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">1. Đánh giá hoạt động tuần qua</label>
            <textarea rows={3} placeholder="Ưu điểm, vi phạm..." value={form.danh_gia} onChange={e => setForm({ ...form, danh_gia: e.target.value })} className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">2. Phương hướng tuần tới</label>
            <textarea rows={3} placeholder="Kế hoạch, phong trào..." value={form.phuong_huong} onChange={e => setForm({ ...form, phuong_huong: e.target.value })} className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
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
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold text-xs">Tuần {it.tuan}</span>
                  <span className="text-xs text-slate-400 font-mono">{it.ngay_hop ? String(it.ngay_hop).slice(0, 10) : ''}</span>
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
                  <textarea rows={2} value={editForm.danh_gia || ''} onChange={e => setEditForm({ ...editForm, danh_gia: e.target.value })} className="w-full p-2 bg-slate-900 border border-cyan-500/50 rounded text-white" />
                  <textarea rows={2} value={editForm.phuong_huong || ''} onChange={e => setEditForm({ ...editForm, phuong_huong: e.target.value })} className="w-full p-2 bg-slate-900 border border-cyan-500/50 rounded text-white" />
                  <input value={editForm.tuyen_duong || ''} onChange={e => setEditForm({ ...editForm, tuyen_duong: e.target.value })} className="w-full p-2 bg-slate-900 border border-cyan-500/50 rounded text-white" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase text-[10px] mb-1">Đánh giá hoạt động:</h5>
                    <p className="text-slate-200 whitespace-pre-line">{it.danh_gia || 'Chưa có đánh giá.'}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase text-[10px] mb-1">Phương hướng:</h5>
                    <p className="text-slate-200 whitespace-pre-line">{it.phuong_huong || 'Chưa có phương hướng.'}</p>
                  </div>
                  {it.tuyen_duong && <div className="col-span-full pt-1 text-emerald-400">★ <b>Tuyên dương:</b> {it.tuyen_duong}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ModuleContainer>
  );
}

// =========================================================================
// PHÂN HỆ 3: ĐÁNH GIÁ & KIỂM ĐỊNH (4 MODULES)
// =========================================================================

// 9. TỔNG HỢP XẾP LOẠI THEO THÔNG TƯ 22 (WORD .DOCX + CRUD + ĐỒNG BỘ HS GỐC)
export function DanhGiaTT22({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [list, setList] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [syncing, setSyncing] = useState(false);
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
    fetch(`/api/tt22?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch(`/api/soyeulylich?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setStudentOptions(data); })
      .catch(() => {});
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleSyncFromLyLich = async () => {
    try {
      setSyncing(true);
      const res = await fetch(`/api/soyeulylich?ma_lop=${encodeURIComponent(currentLop)}`);
      const allStudents = await res.json();
      if (!Array.isArray(allStudents) || allStudents.length === 0) {
        alert(`Chưa có học sinh nào trong Sơ yếu lý lịch của lớp ${currentLop} để đồng bộ! Vui lòng nhập hoặc tải file Excel ở module Sơ yếu lý lịch trước.`);
        setSyncing(false);
        return;
      }
      
      const existingNames = new Set(list.map(it => (it.ho_ten || '').trim().toLowerCase()));
      const toAdd = allStudents.filter(s => s.ho_ten && !existingNames.has(s.ho_ten.trim().toLowerCase()));
      
      if (toAdd.length === 0) {
        alert(`Tất cả ${allStudents.length} học sinh trong Sơ yếu lý lịch lớp ${currentLop} đã có đầy đủ trong bảng Đánh giá TT22!`);
        setSyncing(false);
        return;
      }

      for (const s of toAdd) {
        await fetch('/api/tt22', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ho_ten: s.ho_ten,
            hk1_ht: 'Tốt',
            hk1_rl: 'Tốt',
            cn_ht: 'Tốt',
            danh_hieu: 'Học sinh Tiên tiến',
            ma_lop: currentLop
          })
        });
      }
      alert(`Đã đồng bộ thành công ${toAdd.length} học sinh từ Sơ yếu lý lịch lớp ${currentLop} vào bảng Đánh giá TT22!`);
      loadData();
    } catch (err) {
      alert('Lỗi đồng bộ: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.ho_ten.trim()) return;
    await fetch('/api/tt22', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
    });
    setForm({ ho_ten: '', hk1_ht: 'Tốt', hk1_rl: 'Tốt', cn_ht: 'Tốt', danh_hieu: 'Học sinh Xuất sắc' });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`/api/tt22/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa bản ghi đánh giá này?')) return;
    await fetch(`/api/tt22/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        await fetch('/api/tt22', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ho_ten: parts[0],
            hk1_ht: parts[1] || 'Đạt',
            hk1_rl: parts[2] || 'Tốt',
            cn_ht: parts[3] || 'Đạt',
            danh_hieu: parts[4] || 'Học sinh Tiên tiến',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `TỔNG HỢP ĐÁNH GIÁ XẾP LOẠI THEO THÔNG TƯ 22 - LỚP ${currentLop}`,
      headers: ['STT', 'Họ và tên', 'Học tập HK1', 'Rèn luyện HK1', 'Học tập Cả năm', 'Danh hiệu'],
      rows: list.map((it, idx) => [idx + 1, it.ho_ten, it.hk1_ht, it.hk1_rl, it.cn_ht, it.danh_hieu]),
      filename: `Tong_Hop_Danh_Gia_TT22_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="TỔNG HỢP XẾP LOẠI HỌC SINH THEO THÔNG TƯ 22" desc="Đánh giá kết quả Rèn luyện và Học tập • Tự động đồng bộ từ Sơ yếu lý lịch • Hỗ trợ Word .docx">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleSyncFromLyLich}
            disabled={syncing}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            title="Tự động lấy toàn bộ danh sách học sinh từ Sơ yếu lý lịch vào bảng đánh giá"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ toàn bộ HS từ Sơ yếu lý lịch'}</span>
          </button>
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          Đã đánh giá: <b className="text-cyan-400">{list.length}</b> HS
        </span>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input 
          list="tt22-students-list"
          placeholder="Họ và tên học sinh *" 
          value={form.ho_ten} 
          onChange={e => setForm({ ...form, ho_ten: e.target.value })} 
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" 
          required 
        />
        <datalist id="tt22-students-list">
          {studentOptions.map(s => <option key={s.id} value={s.ho_ten} />)}
        </datalist>
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
        <input placeholder="Danh hiệu" value={form.danh_hieu} onChange={e => setForm({ ...form, danh_hieu: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
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
                      <td className="p-2"><input list="tt22-students-list" value={editForm.ho_ten || ''} onChange={e => setEditForm({ ...editForm, ho_ten: e.target.value })} className="w-full px-2 py-1 bg-slate-900 border border-cyan-500/50 rounded text-xs text-white" /></td>
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

// 10. XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG (WORD .DOCX + CRUD)
export function ThiDuaLop({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ tuan: 1, diem_so: 100, hang_khoi: 1, hang_truong: 1, co_thi_dua: 'Cờ Nhất' });

  const loadData = () => {
    fetch(`/api/thidua?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('/api/thidua', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
    });
    setForm({ tuan: (parseInt(form.tuan) || 0) + 1, diem_so: 100, hang_khoi: 1, hang_truong: 1, co_thi_dua: 'Cờ Nhất' });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`/api/thidua/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa kết quả tuần này?')) return;
    await fetch(`/api/thidua/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch('/api/thidua', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tuan: parseInt(parts[0]) || 1,
            diem_so: parseFloat(parts[1]) || 100,
            hang_khoi: parseInt(parts[2]) || 1,
            hang_truong: parseInt(parts[3]) || 1,
            co_thi_dua: parts[4] || '',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `BẢNG XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG - LỚP ${currentLop}`,
      headers: ['Tuần', 'Điểm số', 'Xếp hạng Khối', 'Hạng Toàn trường', 'Cờ thi đua'],
      rows: list.map(it => [`Tuần ${it.tuan}`, it.diem_so, it.hang_khoi, it.hang_truong, it.co_thi_dua]),
      filename: `Thi_Dua_Doan_Truong_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG" desc="Tổng hợp kết quả nề nếp thi đua tuần (Nhập / Xuất Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input type="number" min="1" placeholder="Tuần" value={form.tuan} onChange={e => setForm({ ...form, tuan: parseInt(e.target.value) || 1 })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input type="number" step="0.1" placeholder="Điểm" value={form.diem_so} onChange={e => setForm({ ...form, diem_so: parseFloat(e.target.value) || 0 })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input type="number" min="1" placeholder="Hạng Khối" value={form.hang_khoi} onChange={e => setForm({ ...form, hang_khoi: parseInt(e.target.value) || 1 })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input type="number" min="1" placeholder="Hạng Trường" value={form.hang_truong} onChange={e => setForm({ ...form, hang_truong: parseInt(e.target.value) || 1 })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Cờ thi đua" value={form.co_thi_dua} onChange={e => setForm({ ...form, co_thi_dua: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
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

// 11. BIÊN BẢN BÀN GIAO NGHỈ TẾT & SINH HOẠT HÈ (WORD .DOCX + CRUD)
export function BienBanBanGiao({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    dot_ban_giao: 'Nghỉ Tết Nguyên Đán 2026',
    ngay_ban_giao: new Date().toISOString().slice(0, 10),
    si_so: classData?.totalStudents || 0,
    tinh_trang: '100% cam kết an toàn giao thông, không pháo nổ',
    dai_dien_dia_phuong: 'Đoàn xã / Ban Chỉ đạo hè'
  });

  const loadData = () => {
    fetch(`/api/bangiao?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('/api/bangiao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
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
    await fetch(`/api/bangiao/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa biên bản này?')) return;
    await fetch(`/api/bangiao/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch('/api/bangiao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dot_ban_giao: parts[0],
            ngay_ban_giao: parts[1] || new Date().toISOString().slice(0, 10),
            si_so: parseInt(parts[2]) || 0,
            tinh_trang: parts[3] || '',
            dai_dien_dia_phuong: parts[4] || '',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `HỒ SƠ BIÊN BẢN BÀN GIAO HỌC SINH NGHỈ TẾT & HÈ - LỚP ${currentLop}`,
      headers: ['STT', 'Đợt bàn giao', 'Ngày bàn giao', 'Sĩ số', 'Tình trạng nề nếp', 'Đại diện địa phương'],
      rows: list.map((it, idx) => [
        idx + 1,
        it.dot_ban_giao,
        it.ngay_ban_giao ? String(it.ngay_ban_giao).slice(0, 10) : '',
        it.si_so,
        it.tinh_trang,
        it.dai_dien_dia_phuong
      ]),
      filename: `Bien_Ban_Ban_Giao_Tet_He_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="BIÊN BẢN BÀN GIAO NGHỈ TẾT & SINH HOẠT HÈ" desc="Hồ sơ bàn giao học sinh về gia đình & địa phương (Nhập / Xuất Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input placeholder="Đợt bàn giao *" value={form.dot_ban_giao} onChange={e => setForm({ ...form, dot_ban_giao: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input type="date" value={form.ngay_ban_giao} onChange={e => setForm({ ...form, ngay_ban_giao: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input type="number" placeholder="Sĩ số" value={form.si_so} onChange={e => setForm({ ...form, si_so: parseInt(e.target.value) || 0 })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Tình trạng cam kết" value={form.tinh_trang} onChange={e => setForm({ ...form, tinh_trang: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <input placeholder="Đại diện địa phương" value={form.dai_dien_dia_phuong} onChange={e => setForm({ ...form, dai_dien_dia_phuong: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
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

// 12. BGH KIỂM TRA & NHẬN XÉT SỔ (WORD .DOCX + CRUD)
export function KiemTraBGH({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    dot_kiem_tra: 'Sơ kết Học kỳ I',
    ngay_duyet: new Date().toISOString().slice(0, 10),
    y_kien_bgh: 'Hồ sơ sổ theo dõi đầy đủ, nề nếp tốt',
    xep_loai: 'Tốt'
  });

  const loadData = () => {
    fetch(`/api/bgh?ma_lop=${encodeURIComponent(currentLop)}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => { loadData(); }, [currentLop]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('/api/bgh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ma_lop: currentLop })
    });
    setForm({
      dot_kiem_tra: 'Tổng kết Cuối năm học',
      ngay_duyet: new Date().toISOString().slice(0, 10),
      y_kien_bgh: 'Hoàn thành tốt nhiệm vụ công tác chủ nhiệm',
      xep_loai: 'Tốt'
    });
    loadData();
  };

  const handleUpdate = async (id) => {
    await fetch(`/api/bgh/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa nhận xét này?')) return;
    await fetch(`/api/bgh/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lines = await parseDocxLines(file);
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        await fetch('/api/bgh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dot_kiem_tra: parts[0],
            ngay_duyet: parts[1] || new Date().toISOString().slice(0, 10),
            y_kien_bgh: parts[2] || '',
            xep_loai: parts[3] || 'Tốt',
            ma_lop: currentLop
          })
        });
      }
    }
    loadData();
    e.target.value = '';
  };

  const handleExportWord = () => {
    exportDocxTable({
      title: `Ý KIẾN BAN GIÁM HIỆU KIỂM TRA SỔ CHỦ NHIỆM - LỚP ${currentLop}`,
      headers: ['STT', 'Đợt kiểm tra', 'Ngày duyệt', 'Ý kiến nhận xét BGH', 'Xếp loại'],
      rows: list.map((it, idx) => [
        idx + 1,
        it.dot_kiem_tra,
        it.ngay_duyet ? String(it.ngay_duyet).slice(0, 10) : '',
        it.y_kien_bgh,
        it.xep_loai
      ]),
      filename: `BGH_Kiem_Tra_So_Chu_Nhiem_${currentLop}`
    });
  };

  return (
    <ModuleContainer title="BGH KIỂM TRA & NHẬN XÉT SỔ CHỦ NHIỆM" desc="Ý kiến chỉ đạo và phê duyệt hồ sơ từ BGH (Nhập / Xuất Word .docx)">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button onClick={handleExportWord} disabled={list.length === 0} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input placeholder="Đợt kiểm tra *" value={form.dot_kiem_tra} onChange={e => setForm({ ...form, dot_kiem_tra: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input type="date" value={form.ngay_duyet} onChange={e => setForm({ ...form, ngay_duyet: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" required />
        <input placeholder="Ý kiến nhận xét của BGH" value={form.y_kien_bgh} onChange={e => setForm({ ...form, y_kien_bgh: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white" />
        <select value={form.xep_loai} onChange={e => setForm({ ...form, xep_loai: e.target.value })} className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white">
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

// =========================================================================
// REGISTRY BẢNG ĐIỀU PHỐI COGS
// =========================================================================
export const MODULE_REGISTRY = [
  {
    pillarId: 'tochuc',
    pillarTitle: 'HỒ SƠ & TỔ CHỨC LỚP',
    modules: [
      { id: 'lylich', title: 'Sơ yếu lý lịch học sinh', icon: Users, component: LyLichHocSinh },
      { id: 'phuhuynh', title: 'Ban đại diện cha mẹ HS', icon: HeartHandshake, component: BanDaiDienPHHS },
      { id: 'canbolop', title: 'Cán bộ lớp - Cán bộ Đoàn', icon: UserCheck, component: CanBoLopDoan },
      { id: 'sodo', title: 'Sơ đồ lớp & Chia tổ', icon: School, component: SoDoLopHoc }
    ]
  },
  {
    pillarId: 'nenep',
    pillarTitle: 'NỀ NẾP & HỌC TẬP',
    modules: [
      { id: 'tkb', title: 'Thời khoá biểu 2 buổi', icon: Calendar, component: ThoiKhoaBieu },
      { id: 'theodoi', title: 'Theo dõi học tập & rèn luyện', icon: TrendingUp, component: TheoDoiHocTap },
      { id: 'cabiet', title: 'Giáo dục HS cá biệt', icon: AlertOctagon, component: GiaoDucCaBiet },
      { id: 'sinhhoat', title: 'Nội dung sinh hoạt lớp', icon: ClipboardList, component: SinhHoatLop }
    ]
  },
  {
    pillarId: 'danhgia',
    pillarTitle: 'ĐÁNH GIÁ & KIỂM ĐỊNH',
    modules: [
      { id: 'tt22', title: 'Tổng hợp xếp loại TT 22', icon: CheckCircle2, component: DanhGiaTT22 },
      { id: 'thidua', title: 'Xếp loại thi đua Đoàn trường', icon: Award, component: ThiDuaLop },
      { id: 'bangiao', title: 'Biên bản bàn giao Tết & Hè', icon: Snowflake, component: BienBanBanGiao },
      { id: 'bgh', title: 'BGH kiểm tra & nhận xét sổ', icon: CheckCheck, component: KiemTraBGH }
    ]
  }
];