import React, { useState } from 'react';
import mammoth from 'mammoth';
import { 
  Users, HeartHandshake, UserCheck, School, 
  Calendar, TrendingUp, AlertOctagon, ClipboardList, 
  CheckCircle2, Award, Snowflake, CheckCheck,
  UserPlus, FileText, Upload, Trash2
} from 'lucide-react';
import ModuleContainer from '../components/ModuleContainer';
import ExcelTableManager from '../components/ExcelTableManager';

// =========================================================================
// PHÂN HỆ 1: TỔ CHỨC & HỒ SƠ LỚP (4 MODULES)
// =========================================================================

// 1. SƠ YẾU LÝ LỊCH HỌC SINH
export function LyLichHocSinh({ classData }) {
  return (
    <ModuleContainer title="SƠ YẾU LÝ LỊCH HỌC SINH" desc="Nhập và xuất Excel danh sách học sinh. Bảng tự động nhận diện tất cả các cột.">
      <ExcelTableManager 
        exportFileName={`So_Yeu_Ly_Lich_${classData?.className || 'Lop'}`}
        emptyNotice="Chưa có dữ liệu lý lịch học sinh. Hãy nhấn 'Nhập Excel' để tải danh sách lớp."
      />
    </ModuleContainer>
  );
}

// 2. BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH
export function BanDaiDienPHHS({ classData }) {
  const defaultCols = ["Họ và tên PHHS", "Phụ huynh của em", "Chức vụ trong Ban", "Số điện thoại", "Ghi chú"];
  return (
    <ModuleContainer title="BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH" desc="Danh sách Ban đại diện PHHS lớp. Hỗ trợ nhập và xuất file Excel.">
      <ExcelTableManager 
        defaultColumns={defaultCols}
        exportFileName={`Ban_Dai_Dien_PHHS_${classData?.className || 'Lop'}`}
        emptyNotice="Chưa có danh sách Ban đại diện PHHS. Nhấn 'Nhập Excel' hoặc cập nhật dữ liệu."
      />
    </ModuleContainer>
  );
}

// 3. CÁN BỘ LỚP CÁN BỘ ĐOÀN (Có Form / Nút Thêm mới)
export function CanBoLopDoan({ classData }) {
  const [leaders, setLeaders] = useState([
    { id: 1, type: 'Lớp', role: 'Lớp trưởng', name: 'Nguyễn Văn A', className: classData?.className || '10A1', phone: '0912345678' },
    { id: 2, type: 'Đoàn', role: 'Bí thư Chi đoàn', name: 'Trần Thị B', className: classData?.className || '10A1', phone: '0987654321' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeader, setNewLeader] = useState({
    type: 'Lớp',
    role: '',
    name: '',
    className: classData?.className || '10A1',
    phone: ''
  });

  const handleAddLeader = (e) => {
    e.preventDefault();
    if (!newLeader.name.trim() || !newLeader.role.trim()) return;

    setLeaders(prev => [...prev, { ...newLeader, id: Date.now() }]);
    setNewLeader({
      type: 'Lớp',
      role: '',
      name: '',
      className: classData?.className || '10A1',
      phone: ''
    });
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setLeaders(prev => prev.filter(item => item.id !== id));
  };

  return (
    <ModuleContainer title="DANH SÁCH CÁN BỘ LỚP CÁN BỘ ĐOÀN" desc="Quản lý ban cán sự lớp và Ban chấp hành Chi đoàn">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-slate-400">Tổng số cán bộ: <b className="text-cyan-400">{leaders.length}</b> em</span>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Thêm cán bộ</span>
        </button>
      </div>

      {/* Modal Thêm cán bộ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Thêm Cán bộ Lớp / Cán bộ Đoàn</h3>
            <form onSubmit={handleAddLeader} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Phân loại</label>
                <select
                  value={newLeader.type}
                  onChange={e => setNewLeader({...newLeader, type: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="Lớp">Ban cán sự Lớp</option>
                  <option value="Đoàn">Ban chấp hành Chi đoàn</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Chức vụ</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp phó Học tập, Phó Bí thư..."
                  value={newLeader.role}
                  onChange={e => setNewLeader({...newLeader, role: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Họ và tên học sinh</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên..."
                  value={newLeader.name}
                  onChange={e => setNewLeader({...newLeader, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Lớp</label>
                <input
                  type="text"
                  required
                  value={newLeader.className}
                  onChange={e => setNewLeader({...newLeader, className: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={newLeader.phone}
                  onChange={e => setNewLeader({...newLeader, phone: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl"
                >
                  Lưu cán bộ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bảng danh sách cán bộ */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="p-3">Hệ</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3">Lớp</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {leaders.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/40">
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.type === 'Lớp' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-3 font-semibold text-white">{item.role}</td>
                <td className="p-3 text-slate-200">{item.name}</td>
                <td className="p-3 font-mono">{item.className}</td>
                <td className="p-3 font-mono">{item.phone}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline">
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleContainer>
  );
}

// 4. SƠ ĐỒ LỚP HỌC & CHIA TỔ
export function SoDoLopHoc() {
  return (
    <ModuleContainer title="SƠ ĐỒ LỚP HỌC & CHIA TỔ" desc="Bố trí vị trí bàn ghế và phân tổ thi đua trực nhật">
      <div className="w-full bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-8">
        <div className="py-2.5 px-8 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg inline-block border border-slate-700">
          BẢNG VIẾT LỚP HỌC & BÀN GIÁO VIÊN
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {['Tổ 1 (Dãy 1)', 'Tổ 2 (Dãy 2)', 'Tổ 3 (Dãy 3)', 'Tổ 4 (Dãy 4)'].map((t, idx) => (
            <div key={idx} className="space-y-3">
              <div className="text-[11px] font-bold text-cyan-400">{t}</div>
              {[1, 2, 3, 4].map(b => (
                <div key={b} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-500">
                  Bàn {b} (Trống)
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ModuleContainer>
  );
}

// =========================================================================
// PHÂN HỆ 2: NỀ NẾP & HỌC TẬP (4 MODULES)
// =========================================================================

// 5. THỜI KHOÁ BIỂU 2 BUỔI (Gồm TKB Sáng & TKB Buổi 2 xài chung Excel Manager)
export function ThoiKhoaBieu({ classData }) {
  const tkbCols = ["Tiết", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const defaultSang = [
    ["Tiết 1", "Chào cờ", "Toán", "Vật lí", "Hoá học", "Ngữ văn", "Tiếng Anh"],
    ["Tiết 2", "Sinh hoạt", "Toán", "Vật lí", "Sinh học", "Ngữ văn", "Tiếng Anh"],
    ["Tiết 3", "Lịch sử", "Tin học", "Địa lí", "GDCD", "Toán", "Thể dục"],
    ["Tiết 4", "Địa lí", "Tin học", "Tiếng Anh", "Thể dục", "Toán", "Công nghệ"],
    ["Tiết 5", "GDQP", "-", "Tiếng Anh", "-", "-", "Sinh hoạt lớp"]
  ];

  const defaultChieu = [
    ["Tiết 1 (Chiều)", "Phụ đạo Toán", "Phụ đạo Văn", "Phụ đạo Anh", "Bồi dưỡng HSG", "-"],
    ["Tiết 2 (Chiều)", "Phụ đạo Toán", "Phụ đạo Văn", "Phụ đạo Anh", "Bồi dưỡng HSG", "-"],
    ["Tiết 3 (Chiều)", "Hoạt động trải nghiệm", "Thể thao", "-", "-", "-"]
  ];

  return (
    <ModuleContainer title="THỜI KHOÁ BIỂU 2 BUỔI" desc="Quản lý lịch học chính khoá (sáng) và buổi 2 (chiều). Hỗ trợ nhập/xuất file Excel.">
      <div className="space-y-8">
        <div>
          <h3 className="text-xs font-bold text-cyan-400 uppercase mb-3">1. Thời khoá biểu Chính khoá (Buổi sáng)</h3>
          <ExcelTableManager 
            defaultColumns={tkbCols} 
            defaultRows={defaultSang} 
            exportFileName={`TKB_Sang_${classData?.className || 'Lop'}`}
          />
        </div>

        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-xs font-bold text-amber-400 uppercase mb-3">2. Thời khoá biểu Tăng tiết / Phụ đạo (Buổi 2)</h3>
          <ExcelTableManager 
            defaultColumns={["Tiết chiều", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"]} 
            defaultRows={defaultChieu} 
            exportFileName={`TKB_Chieu_${classData?.className || 'Lop'}`}
          />
        </div>
      </div>
    </ModuleContainer>
  );
}

// 6. THEO DÕI HỌC TẬP & RÈN LUYỆN
export function TheoDoiHocTap() {
  return (
    <ModuleContainer title="THEO DÕI HỌC TẬP & RÈN LUYỆN" desc="Nhật ký ghi nhận điểm số, vi phạm nề nếp hàng ngày">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3">Ngày</th><th className="p-3">Học sinh</th><th className="p-3">Môn</th>
            <th className="p-3">Điểm / Nhận xét</th><th className="p-3">Vi phạm / Khen thưởng</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-800 text-center text-slate-500">
            <td colSpan="5" className="py-12">Chưa có dữ liệu theo dõi học tập</td>
          </tr>
        </tbody>
      </table>
    </ModuleContainer>
  );
}

// 7. GIÁO DỤC HỌC SINH CÁ BIỆT
export function GiaoDucCaBiet() {
  return (
    <ModuleContainer title="HỒ SƠ GIÁO DỤC HỌC SINH CÁ BIỆT" desc="Kế hoạch giúp đỡ, uốn nắn và phối hợp phụ huynh">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3">STT</th><th className="p-3">Học sinh</th><th className="p-3">Biểu hiện vi phạm</th>
            <th className="p-3">Biện pháp GVCN</th><th className="p-3">Xác nhận PHHS</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-800 text-center text-slate-500">
            <td colSpan="5" className="py-12">Không có học sinh trong diện theo dõi đặc biệt</td>
          </tr>
        </tbody>
      </table>
    </ModuleContainer>
  );
}

// 8. NỘI DUNG SINH HOẠT LỚP
export function SinhHoatLop() {
  return (
    <ModuleContainer title="NỘI DUNG & BIÊN BẢN SINH HOẠT LỚP" desc="Đánh giá nề nếp tuần, tuyên dương tổ xuất sắc và phương hướng tuần tới">
      <div className="space-y-4 text-xs text-slate-300">
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <h4 className="font-bold text-white mb-2 uppercase">1. Đánh giá hoạt động tuần qua</h4>
          <p className="text-slate-500 italic">[Chưa cập nhật biên bản tuần]</p>
        </div>
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <h4 className="font-bold text-white mb-2 uppercase">2. Kế hoạch công tác tuần tới</h4>
          <p className="text-slate-500 italic">[Chưa cập nhật phương hướng]</p>
        </div>
      </div>
    </ModuleContainer>
  );
}

// =========================================================================
// PHÂN HỆ 3: ĐÁNH GIÁ & KIỂM ĐỊNH (4 MODULES)
// =========================================================================

// 9. TỔNG HỢP ĐÁNH GIÁ THÔNG TƯ 22
export function DanhGiaTT22() {
  return (
    <ModuleContainer title="TỔNG HỢP XẾP LOẠI HỌC SINH THEO THÔNG TƯ 22" desc="Đánh giá kết quả Rèn luyện và Học tập học kỳ / cả năm">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3">STT</th><th className="p-3">Họ và tên</th><th className="p-3">Học tập HK1</th>
            <th className="p-3">Rèn luyện HK1</th><th className="p-3">Học tập Cả năm</th><th className="p-3">Danh hiệu</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-800 text-center text-slate-500">
            <td colSpan="6" className="py-12">Chưa có kết quả tổng hợp xếp loại</td>
          </tr>
        </tbody>
      </table>
    </ModuleContainer>
  );
}

// 10. XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG
export function ThiDuaLop() {
  return (
    <ModuleContainer title="XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG" desc="Tổng hợp điểm thi đua nề nếp các tuần và cờ thi đua toàn trường">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3">Tuần</th><th className="p-3">Điểm số</th><th className="p-3">Xếp hạng Khối</th>
            <th className="p-3">Hạng Toàn trường</th><th className="p-3">Cờ thi đua</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-800 text-center text-slate-500">
            <td colSpan="5" className="py-12">Chưa có dữ liệu thi đua tuần</td>
          </tr>
        </tbody>
      </table>
    </ModuleContainer>
  );
}

// 11. BIÊN BẢN BÀN GIAO NGHỈ TẾT & SINH HOẠT HÈ (DÙNG MAMMOTH ĐỌC .DOCX / .DOC)
export function BienBanBanGiao({ classData }) {
  const [docHtml, setDocHtml] = useState('');
  const [docName, setDocName] = useState('');

  const handleDocxUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      try {
        // Mammoth chuyển đổi ArrayBuffer của file DOCX sang HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocHtml(result.value);
      } catch (error) {
        alert("Lỗi khi đọc file Word (.docx). Vui lòng đảm bảo file định dạng chuẩn.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <ModuleContainer 
      title="BIÊN BẢN BÀN GIAO NGHỈ TẾT & SINH HOẠT HÈ" 
      desc="Xem trước và quản lý các biên bản bàn giao Word (.docx) gửi phụ huynh và Đoàn địa phương."
    >
      <div className="space-y-4">
        {/* Nút upload file Word */}
        <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file Word biên bản (.docx)</span>
              <input type="file" accept=".docx, .doc" onChange={handleDocxUpload} className="hidden" />
            </label>
            {docName && (
              <span className="text-xs text-blue-400 font-mono">
                Đang xem: <b>{docName}</b>
              </span>
            )}
          </div>

          {docHtml && (
            <button
              onClick={() => { setDocHtml(''); setDocName(''); }}
              className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs"
            >
              Đóng văn bản
            </button>
          )}
        </div>

        {/* Khung đọc nội dung Word Rendered bằng Mammoth */}
        {docHtml ? (
          <div className="bg-white text-slate-900 p-8 rounded-xl max-h-[600px] overflow-y-auto shadow-2xl prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: docHtml }} />
          </div>
        ) : (
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-4 leading-relaxed">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Trạng thái: <b>Mẫu văn bản mặc định</b></span>
              <span>Sĩ số bàn giao: <b>{classData?.totalStudents || 0} em</b></span>
            </div>
            <p>Cam kết 100% học sinh chấp hành nghiêm chỉnh luật An toàn giao thông, không sử dụng pháo nổ trái phép dịp Tết và tích cực tham gia sinh hoạt hè tại địa phương.</p>
            <p className="text-slate-500 italic">Thầy/Cô có thể tải lên file .docx chính thức của trường bằng nút phía trên để xem văn bản đầy đủ.</p>
            <div className="pt-6 flex justify-around text-center text-slate-400">
              <div><p className="font-bold text-slate-200">ĐẠI DIỆN ĐỊA PHƯƠNG</p><span className="text-[10px]">(Ký tên, đóng dấu)</span></div>
              <div><p className="font-bold text-slate-200">GIÁO VIÊN CHỦ NHIỆM</p><span className="text-[10px]">(Ký và ghi rõ họ tên)</span></div>
            </div>
          </div>
        )}
      </div>
    </ModuleContainer>
  );
}

// 12. BGH KIỂM TRA & NHẬN XÉT SỔ
export function KiemTraBGH() {
  return (
    <ModuleContainer title="BGH KIỂM TRA & NHẬN XÉT SỔ CHỦ NHIỆM" desc="Ý kiến chỉ đạo và phê duyệt hồ sơ từ Ban Giám Hiệu nhà trường">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3">Đợt kiểm tra</th><th className="p-3">Ngày duyệt</th>
            <th className="p-3">Ý kiến nhận xét BGH</th><th className="p-3">Xếp loại</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          <tr className="hover:bg-slate-800/40">
            <td className="p-3 font-semibold text-white">Sơ kết Học kỳ I</td><td className="p-3 text-slate-500">-</td>
            <td className="p-3 text-slate-500">[Chưa kiểm tra]</td><td className="p-3 text-slate-500">-</td>
          </tr>
          <tr className="hover:bg-slate-800/40">
            <td className="p-3 font-semibold text-white">Tổng kết Cuối năm học</td><td className="p-3 text-slate-500">-</td>
            <td className="p-3 text-slate-500">[Chưa kiểm tra]</td><td className="p-3 text-slate-500">-</td>
          </tr>
        </tbody>
      </table>
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