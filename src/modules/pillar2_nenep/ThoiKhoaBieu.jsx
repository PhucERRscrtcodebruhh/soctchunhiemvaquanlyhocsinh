import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ModuleContainer from '../../components/ModuleContainer';
import { parseDocxLines, exportDocxTable } from '../../utils/wordHandler';

const API = '/api/tkb';

export default function ThoiKhoaBieu() {
  const [schedule, setSchedule] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [newRow, setNewRow] = useState({
    buoi: 'SANG',
    tiet: 1,
    thu_2: '',
    thu_3: '',
    thu_4: '',
    thu_5: '',
    thu_6: '',
    thu_7: ''
  });

  // Nạp dữ liệu từ MySQL (nếu trống sẽ tự khởi tạo khung 5 tiết sáng + 3 tiết chiều)
  const loadData = () => {
    fetch(`${API}/init`, { method: 'POST' })
      .then(() => fetch(API))
      .then(res => res.json())
      .then(data => setSchedule(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. THÊM TIẾT/MÔN MỚI
  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRow)
    });
    setNewRow({
      buoi: newRow.buoi,
      tiet: Number(newRow.tiet) + 1,
      thu_2: '',
      thu_3: '',
      thu_4: '',
      thu_5: '',
      thu_6: '',
      thu_7: ''
    });
    loadData();
  };

  // 2. SỬA MÔN TRỰC TIẾP
  const handleStartEdit = (row) => {
    setEditingId(row.id);
    setEditRow({ ...row });
  };

  const handleSaveEdit = async (id) => {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editRow)
    });
    setEditingId(null);
    loadData();
  };

  // 3. XÓA TIẾT/MÔN
  const handleDeletePeriod = async (id) => {
    if (!window.confirm('Cậu có chắc muốn xóa tiết học này khỏi TKB không?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadData();
  };

  // 4. NHẬP TỆP WORD (.docx)
  // Format từng dòng trong Word: Buổi | Tiết | Thứ 2 | Thứ 3 | Thứ 4 | Thứ 5 | Thứ 6 | Thứ 7
  const handleImportWord = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const lines = await parseDocxLines(file);
      for (const line of lines) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 2) {
          await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buoi: parts[0]?.toUpperCase().includes('CHIỀU') ? 'CHIEU' : 'SANG',
              tiet: parseInt(parts[1], 10) || 1,
              thu_2: parts[2] || '',
              thu_3: parts[3] || '',
              thu_4: parts[4] || '',
              thu_5: parts[5] || '',
              thu_6: parts[6] || '',
              thu_7: parts[7] || ''
            })
          });
        }
      }
      loadData();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đọc file Word TKB!');
    }
    e.target.value = '';
  };

  // 5. XUẤT TỆP WORD (.docx)
  const handleExportWord = () => {
    exportDocxTable({
      title: 'THỜI KHÓA BIỂU TOÀN TRƯỜNG (2 BUỔI)',
      headers: ['Buổi', 'Tiết', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
      rows: schedule.map(row => [
        row.buoi === 'SANG' ? 'Sáng' : 'Chiều',
        `Tiết ${row.tiet}`,
        row.thu_2,
        row.thu_3,
        row.thu_4,
        row.thu_5,
        row.thu_6,
        row.thu_7
      ]),
      filename: 'Thoi_Khoa_Bieu'
    });
  };

  return (
    <ModuleContainer 
      title="THỜI KHÓA BIỂU 2 BUỔI" 
      desc="Quản lý lịch học: Thêm tiết, sửa môn học trực tiếp, xóa tiết và Nhập/Xuất văn bản Word (.docx)"
    >
      {/* Thanh công cụ Nhập / Xuất Word */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex gap-2">
          <label className="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Word (.docx)</span>
            <input type="file" accept=".docx" onChange={handleImportWord} className="hidden" />
          </label>
          <button
            onClick={handleExportWord}
            disabled={schedule.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Word (.docx)</span>
          </button>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Tổng số: <b className="text-cyan-400">{schedule.length}</b> tiết học
        </span>
      </div>

      {/* Form thêm tiết / môn mới */}
      <form onSubmit={handleCreatePeriod} className="flex flex-wrap gap-2 mb-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800 items-center">
        <select
          value={newRow.buoi}
          onChange={e => setNewRow({ ...newRow, buoi: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value="SANG">Buổi Sáng</option>
          <option value="CHIEU">Buổi Chiều</option>
        </select>
        <input
          type="number"
          min="1"
          max="10"
          value={newRow.tiet}
          onChange={e => setNewRow({ ...newRow, tiet: parseInt(e.target.value, 10) || 1 })}
          placeholder="Tiết"
          title="Tiết số"
          className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white text-center font-mono"
          required
        />
        {['thu_2', 'thu_3', 'thu_4', 'thu_5', 'thu_6', 'thu_7'].map((day, idx) => (
          <input
            key={day}
            placeholder={`Thứ ${idx + 2}`}
            value={newRow[day]}
            onChange={e => setNewRow({ ...newRow, [day]: e.target.value })}
            className="w-20 lg:w-24 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white text-center"
          />
        ))}
        <button type="submit" className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 ml-auto transition">
          <Plus className="w-3.5 h-3.5" /> Thêm tiết
        </button>
      </form>

      {/* Bảng thời khóa biểu */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-center text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-16">Buổi</th>
              <th className="p-3 w-16">Tiết</th>
              <th className="p-3">Thứ 2</th>
              <th className="p-3">Thứ 3</th>
              <th className="p-3">Thứ 4</th>
              <th className="p-3">Thứ 5</th>
              <th className="p-3">Thứ 6</th>
              <th className="p-3">Thứ 7</th>
              <th className="p-3 w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {schedule.map(row => {
              const isEdit = editingId === row.id;
              return (
                <tr key={row.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-2 font-bold text-cyan-400">
                    {row.buoi === 'SANG' ? 'Sáng' : 'Chiều'}
                  </td>
                  <td className="p-2 text-slate-400 font-mono">
                    Tiết {row.tiet}
                  </td>

                  {/* 6 ngày trong tuần */}
                  {['thu_2', 'thu_3', 'thu_4', 'thu_5', 'thu_6', 'thu_7'].map(thu => (
                    <td key={thu} className="p-1.5">
                      {isEdit ? (
                        <input
                          value={editRow[thu] ?? ''}
                          onChange={e => setEditRow({ ...editRow, [thu]: e.target.value })}
                          className="w-full min-w-[70px] px-1.5 py-1 bg-slate-950 border border-cyan-500/60 rounded text-center text-xs text-white"
                        />
                      ) : (
                        <span className={row[thu] ? 'font-medium text-white' : 'text-slate-600'}>
                          {row[thu] || '-'}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* Nút sửa / xóa / lưu */}
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {isEdit ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(row.id)}
                            title="Lưu thay đổi"
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            title="Hủy bỏ"
                            className="p-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(row)}
                            title="Sửa môn học"
                            className="text-cyan-400 hover:text-cyan-300 p-1 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(row.id)}
                            title="Xóa tiết học"
                            className="text-red-400 hover:text-red-300 p-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {schedule.length === 0 && (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-500">
                  Chưa có lịch thời khóa biểu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}