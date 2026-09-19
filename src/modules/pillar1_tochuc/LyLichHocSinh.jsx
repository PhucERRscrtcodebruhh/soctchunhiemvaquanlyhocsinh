import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Trash2, Plus, Loader2 } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';

export default function LyLichHocSinh() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [newRow, setNewRow] = useState({
    ho_ten: '',
    to_so: 1,
    chuc_vu_to: 'Thành viên',
    ghi_chu: ''
  });

  // 1. LẤY DỮ LIỆU TỪ SERVER VỀ KHI MỞ TRANG
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/to-hocsinh');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách học sinh:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. THÊM THỦ CÔNG 1 HỌC SINH VÀO SERVER
  const handleAddManualRow = async (e) => {
    e.preventDefault();
    if (!newRow.ho_ten.trim()) return;

    try {
      const res = await fetch('/api/to-hocsinh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow)
      });
      if (res.ok) {
        const created = await res.json();
        setStudents(prev => [...prev, created]);
        setNewRow({ ho_ten: '', to_so: 1, chuc_vu_to: 'Thành viên', ghi_chu: '' });
      }
    } catch (error) {
      alert('Không thể lưu học sinh vào máy chủ!');
    }
  };

  // 3. NHẬP EXCEL VÀ LƯU HÀNG LOẠT VÀO MYSQL
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

          // Duyệt và lưu từng học sinh lên server
          for (const row of contentRows) {
            // Giả định thứ tự cột file excel: Họ tên (cột 1 hoặc 0), Tổ, Chức vụ, Ghi chú
            const ho_ten = String(row[1] || row[0] || '').trim();
            if (!ho_ten) continue;

            const payload = {
              ho_ten: ho_ten,
              to_so: Number(row[2]) || 1,
              chuc_vu_to: String(row[3] || 'Thành viên'),
              ghi_chu: String(row[4] || '')
            };

            await fetch('/api/to-hocsinh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }

          await fetchStudents();
          alert('Nhập danh sách từ Excel vào hệ thống thành công!');
        }
      } catch (err) {
        alert('Lỗi đọc tệp Excel!');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // 4. XÓA HỌC SINH KHỎI DATABASE
  const handleDeleteRow = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa học sinh này khỏi danh sách?')) return;
    try {
      const res = await fetch(`/api/to-hocsinh/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      alert('Không thể xóa học sinh!');
    }
  };

  return (
    <ModuleContainer title="SƠ YẾU LÝ LỊCH HỌC SINH" desc="Nhập danh sách học sinh từ Excel hoặc thủ công - Đồng bộ trực tiếp Cơ sở dữ liệu">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition">
            <Upload className="w-4 h-4" />
            <span>Tải lên file Excel (.xlsx, .xls)</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
          {fileName && (
            <span className="text-xs text-cyan-400 font-mono">
              Tệp vừa tải: <b>{fileName}</b>
            </span>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang xử lý dữ liệu máy chủ...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleAddManualRow} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <input
          placeholder="Họ và tên học sinh *"
          value={newRow.ho_ten}
          onChange={e => setNewRow({ ...newRow, ho_ten: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          required
        />
        <select
          value={newRow.to_so}
          onChange={e => setNewRow({ ...newRow, to_so: Number(e.target.value) })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value={1}>Tổ 1</option>
          <option value={2}>Tổ 2</option>
          <option value={3}>Tổ 3</option>
          <option value={4}>Tổ 4</option>
        </select>
        <input
          placeholder="Chức vụ (Tổ trưởng, Thành viên...)"
          value={newRow.chuc_vu_to}
          onChange={e => setNewRow({ ...newRow, chuc_vu_to: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <input
          placeholder="Ghi chú (SĐT/Thông tin khác)"
          value={newRow.ghi_chu}
          onChange={e => setNewRow({ ...newRow, ghi_chu: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Thêm học sinh
        </button>
      </form>

      {students.length === 0 && !loading ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Chưa có dữ liệu học sinh trong Cơ sở dữ liệu</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Nhập học sinh bằng form phía trên hoặc tải lên file Excel để lưu trực tiếp vào cơ sở dữ liệu.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-800/95 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-3 text-center w-12">STT</th>
                <th className="p-3 font-bold">Họ và tên</th>
                <th className="p-3 font-bold">Tổ</th>
                <th className="p-3 font-bold">Chức vụ trong tổ</th>
                <th className="p-3 font-bold">Ghi chú</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((student, idx) => (
                <tr key={student.id || idx} className="hover:bg-slate-800/40">
                  <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                  <td className="p-3 font-semibold text-white">{student.ho_ten}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-medium">
                      Tổ {student.to_so}
                    </span>
                  </td>
                  <td className="p-3">{student.chuc_vu_to || 'Thành viên'}</td>
                  <td className="p-3 text-slate-400">{student.ghi_chu || '-'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteRow(student.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Xóa học sinh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModuleContainer>
  );
}