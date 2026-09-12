import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, HeartHandshake, UserCheck, School, 
  Calendar, TrendingUp, AlertOctagon, ClipboardList, 
  CheckCircle2, Award, Snowflake, CheckCheck,
  Upload, Trash2
} from 'lucide-react';
import ModuleContainer from '../components/ModuleContainer';

// =========================================================================
// PHÂN HỆ 1: TỔ CHỨC & HỒ SƠ LỚP (4 MODULES)
// =========================================================================

// 1. SƠ YẾU LÝ LỊCH HỌC SINH (Nhận file Excel tự co giãn cột và hàng)
export function LyLichHocSinh({ classData }) {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Đọc toàn bộ ma trận dữ liệu từ sheet
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data && data.length > 0) {
        // Hàng 0 làm tiêu đề cột
        const headers = data[0].filter(h => h !== undefined && h !== null && h !== '');
        // Các hàng tiếp theo là danh sách học sinh
        const contentRows = data.slice(1).filter(r => r && r.some(c => c !== undefined && c !== null && c !== ''));

        setColumns(headers);
        setRows(contentRows);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleClear = () => {
    setColumns([]);
    setRows([]);
    setFileName('');
  };

  return (
    <ModuleContainer 
      title="SƠ YẾU LÝ LỊCH HỌC SINH" 
      desc="Tải lên tệp Excel danh sách học sinh. Bảng sẽ tự động nhận diện toàn bộ số cột và số hàng của tệp."
    >
      {/* Khung công cụ upload */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-500/10">
            <Upload className="w-4 h-4" />
            <span>Tải lên file Excel (.xlsx, .xls)</span>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
          {fileName && (
            <span className="text-xs text-cyan-400 font-mono">
              Đang mở: <b>{fileName}</b> ({rows.length} hàng)
            </span>
          )}
        </div>

        {columns.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-1.5 border border-red-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xoá bảng</span>
          </button>
        )}
      </div>

      {/* Hiển thị bảng động */}
      {columns.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Chưa có dữ liệu danh sách học sinh</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Thầy/Cô hãy tải lên file Excel danh sách lớp. Bảng sẽ tự động co giãn theo các cột và hàng trong file.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-800/95 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 backdrop-blur">
              <tr>
                <th className="p-3 border-b border-slate-700 w-12 text-center">STT</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3 border-b border-slate-700 font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-center font-mono text-slate-500">{rIdx + 1}</td>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="p-3">
                      {row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModuleContainer>
  );
}

// 2. BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH
export function BanDaiDienPHHS() {
  return (
    <ModuleContainer title="BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH" desc="Danh sách Ban đại diện PHHS lớp nhiệm kỳ 2026 - 2027">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3">STT</th><th className="p-3">Họ và tên PHHS</th><th className="p-3">Phụ huynh của em</th>
            <th className="p-3">Chức vụ trong Ban</th><th className="p-3">Số điện thoại</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-800 text-center text-slate-500">
            <td colSpan="5" className="py-12">Chưa thiết lập ban đại diện cha mẹ học sinh</td>
          </tr>
        </tbody>
      </table>
    </ModuleContainer>
  );
}

// 3. DANH SÁCH CÁN BỘ LỚP CÁN BỘ ĐOÀN
export function CanBoLopDoan() {
  return (
    <ModuleContainer title="DANH SÁCH CÁN BỘ LỚP CÁN BỘ ĐOÀN" desc="Ban cán sự lớp và Ban chấp hành Chi đoàn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400">
          <h4 className="font-bold text-cyan-400 uppercase mb-3">Ban cán sự lớp</h4>
          <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Lớp trưởng:</span> <b className="text-slate-300">[Chưa chọn]</b></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Lớp phó Học tập:</span> <b className="text-slate-300">[Chưa chọn]</b></div>
          <div className="flex justify-between py-1.5"><span>Lớp phó Lao động:</span> <b className="text-slate-300">[Chưa chọn]</b></div>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400">
          <h4 className="font-bold text-amber-400 uppercase mb-3">BCH Chi đoàn</h4>
          <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Bí thư Chi đoàn:</span> <b className="text-slate-300">[Chưa chọn]</b></div>
          <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Phó Bí thư:</span> <b className="text-slate-300">[Chưa chọn]</b></div>
          <div className="flex justify-between py-1.5"><span>Ủy viên:</span> <b className="text-slate-300">[Chưa chọn]</b></div>
        </div>
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

// 5. THỜI KHOÁ BIỂU 2 BUỔI
export function ThoiKhoaBieu() {
  return (
    <ModuleContainer title="THỜI KHOÁ BIỂU 2 BUỔI" desc="Thời khoá biểu chính khoá và lịch học phụ đạo buổi 2">
      <table className="w-full text-center text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3 text-left">Tiết</th><th>Thứ 2</th><th>Thứ 3</th><th>Thứ 4</th><th>Thứ 5</th><th>Thứ 6</th><th>Thứ 7</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {[1, 2, 3, 4, 5].map(p => (
            <tr key={p} className="hover:bg-slate-800/40">
              <td className="p-3 text-left font-bold text-slate-500">Tiết {p}</td>
              <td className="p-3 text-slate-600">-</td><td className="p-3 text-slate-600">-</td><td className="p-3 text-slate-600">-</td>
              <td className="p-3 text-slate-600">-</td><td className="p-3 text-slate-600">-</td><td className="p-3 text-slate-600">-</td>
            </tr>
          ))}
        </tbody>
      </table>
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

// 11. BIÊN BẢN BÀN GIAO NGHỈ TẾT & SINH HOẠT HÈ
export function BienBanBanGiao({ classData }) {
  return (
    <ModuleContainer title="BIÊN BẢN BÀN GIAO NGHỈ TẾT & SINH HOẠT HÈ" desc="Hồ sơ bàn giao nề nếp học sinh về gia đình và chính quyền địa phương">
      <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-4">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span>Tình trạng: <b>Đã chuẩn bị mẫu bàn giao</b></span>
          <span>Sĩ số bàn giao: <b>{classData?.totalStudents || 0} học sinh</b></span>
        </div>
        <p>Cam kết chấp hành 100% luật An toàn giao thông, phòng chống cháy nổ pháo dịp Tết và tham gia phong trào tình nguyện hè tại địa phương.</p>
        <div className="pt-6 flex justify-around text-center text-slate-400">
          <div><p className="font-bold text-slate-200">ĐẠI DIỆN ĐỊA PHƯƠNG</p><span className="text-[10px]">(Ký tên, đóng dấu)</span></div>
          <div><p className="font-bold text-slate-200">GIÁO VIÊN CHỦ NHIỆM</p><span className="text-[10px]">(Ký và ghi rõ họ tên)</span></div>
        </div>
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
// REGISTRY BẢNG ĐIỀU PHỐI COGS (GẮN ICON & COMPONENT)
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