import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, HeartHandshake, UserCheck, School, 
  Calendar, TrendingUp, AlertOctagon, ClipboardList, 
  CheckCircle2, Award, Snowflake, CheckCheck, RefreshCw
} from 'lucide-react';
import ModuleContainer from '../components/ModuleContainer';
import ExcelSpreadsheetEditor from '../components/ExcelSpreadsheetEditor';
import ModuleWordEditor from '../components/ModuleWordEditor';

// =========================================================================
// PHÂN HỆ 1: TỔ CHỨC & HỒ SƠ LỚP (4 MODULES)
// =========================================================================

// 1. SƠ YẾU LÝ LỊCH HỌC SINH (EXCEL SPREADSHEET PAD + ĐỒNG BỘ MYSQL)
export function LyLichHocSinh({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridKey, setGridKey] = useState(0);

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
      setGridKey(k => k + 1);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentLop]);

  // Khởi tạo bảng tính 2D từ danh sách học sinh thật trong MySQL
  const initialGrid = useMemo(() => {
    const headers = ['STT', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Họ tên Cha/Mẹ', 'Số điện thoại', 'Địa chỉ', 'Tổ số', 'Chức vụ trong tổ'];
    if (students.length === 0) {
      return [
        headers,
        [1, 'Nguyễn Văn An', '15/05/2010', 'Nam', 'Nguyễn Văn Ba', '0912345678', 'Phù Cừ, Hưng Yên', 1, 'Tổ trưởng'],
        [2, 'Trần Thị Bích', '20/08/2010', 'Nữ', 'Trần Văn Cảnh', '0987654321', 'Phù Cừ, Hưng Yên', 1, 'Thành viên'],
        [3, 'Lê Hoàng Cường', '12/11/2010', 'Nam', 'Lê Văn Dũng', '0978112233', 'Phù Cừ, Hưng Yên', 2, 'Tổ trưởng'],
        [4, 'Phạm Minh Đức', '05/03/2010', 'Nam', 'Phạm Văn Em', '0965443322', 'Phù Cừ, Hưng Yên', 2, 'Thành viên'],
        [5, 'Hoàng Thuỳ Dung', '18/09/2010', 'Nữ', 'Hoàng Văn Giang', '0911223344', 'Phù Cừ, Hưng Yên', 3, 'Tổ trưởng']
      ];
    }
    const rows = students.map((s, idx) => [
      idx + 1,
      s.ho_ten || '',
      s.ngay_sinh || '',
      s.gioi_tinh || 'Nam',
      s.ho_ten_ph || '',
      s.so_dien_thoai || '',
      s.dia_chi || '',
      s.to_so || 1,
      s.chuc_vu_to || 'Thành viên'
    ]);
    return [headers, ...rows];
  }, [students]);

  // Xử lý khi nhấn "Lưu thay đổi": Parse grid và gửi sync về MySQL tbl_soyeulylich
  const handleSaveToBackend = async ({ sheets }) => {
    const activeSheetName = Object.keys(sheets)[0] || 'Sheet1';
    const rawRows = sheets[activeSheetName] || [];
    if (rawRows.length <= 1) return;

    const contentRows = rawRows.slice(1).filter(r => r && r.some(c => c !== undefined && c !== null && String(c).trim() !== ''));

    const parsedStudents = contentRows.map(r => {
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

    const res = await fetch('/api/soyeulylich/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: parsedStudents, ma_lop: currentLop })
    });

    if (res.ok) {
      loadData();
    }
  };

  return (
    <ModuleContainer 
      title="SƠ YẾU LÝ LỊCH HỌC SINH" 
      desc={`Bảng tính tương tác trực tuyến • Tự động đồng bộ MySQL lớp ${currentLop} • Nhập / Xuất Excel (.xlsx)`}
    >
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Đang nạp dữ liệu hồ sơ học sinh từ cơ sở dữ liệu MySQL...</span>
        </div>
      ) : (
        <ExcelSpreadsheetEditor
          key={`lylich-${currentLop}-${gridKey}`}
          initialData={initialGrid}
          defaultFileName={`So_Yeu_Ly_Lich_${currentLop}`}
          maLop={currentLop}
          title={`SƠ YẾU LÝ LỊCH HỌC SINH - LỚP ${currentLop}`}
          onSaveToBackend={handleSaveToBackend}
        />
      )}
    </ModuleContainer>
  );
}

// 2. BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH (WORD RICH-TEXT EDITOR)
export function BanDaiDienPHHS({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">SỞ GIÁO DỤC VÀ ĐÀO TẠO HƯNG YÊN</p>
      <p style="font-weight: bold; margin-bottom: 10px; text-transform: uppercase; color: #0284c7;">TRƯỜNG THPT PHÙ CỪ</p>
      <p style="margin-bottom: 12px;">------------------------</p>
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">DANH SÁCH BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Lớp: ${currentLop} • Năm học 2026 - 2027</p>
    </div>

    <p style="line-height: 1.6; margin-bottom: 12px;">Căn cứ Điều lệ Ban đại diện cha mẹ học sinh ban hành kèm theo Thông tư 55/2011/TT-BGDĐT; Hội nghị cha mẹ học sinh lớp ${currentLop} đã bầu ra Ban đại diện gồm các ông/bà sau:</p>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">STT</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Họ và tên PHHS</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Phụ huynh của em</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Chức vụ</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Số điện thoại</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Địa chỉ cư trú</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">1</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Nguyễn Văn Ba</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Nguyễn Văn An</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #0284c7; font-weight: bold;">Trưởng ban</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0912.345.678</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Thị trấn Trần Cao, Phù Cừ</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">2</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Trần Văn Cảnh</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Trần Thị Bích</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Phó Trưởng ban</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0987.654.321</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Xã Đình Cao, Phù Cừ</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">3</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Lê Văn Dũng</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Lê Hoàng Cường</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Uỷ viên Thường trực</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0978.112.233</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Xã Đoàn Đào, Phù Cừ</td>
        </tr>
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 35px;">
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">TRƯỞNG BAN ĐẠI DIỆN PHHS</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký và ghi rõ họ tên)</p>
      </div>
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">GIÁO VIÊN CHỦ NHIỆM</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký và ghi rõ họ tên)</p>
      </div>
    </div>
  `;

  return (
    <ModuleWordEditor
      moduleId="phuhuynh"
      moduleTitle="BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH"
      moduleDesc={`Hồ sơ Ban đại diện PHHS lớp ${currentLop} • Chỉnh sửa Word trực tiếp • Tự động lưu MySQL`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Ban_Dai_Dien_PHHS_${currentLop}`}
    />
  );
}

// 3. CÁN BỘ ĐOÀN & CÁN BỘ LỚP (WORD RICH-TEXT EDITOR)
export function CanBoLopDoan({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">ĐOÀN TNCS HỒ CHÍ MINH TRƯỜNG THPT PHÙ CỪ</p>
      <p style="font-weight: bold; margin-bottom: 10px; text-transform: uppercase; color: #0284c7;">CHI ĐOÀN & BAN CÁN SỰ LỚP ${currentLop}</p>
      <p style="margin-bottom: 12px;">------------------------</p>
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">DANH SÁCH BAN CÁN SỰ LỚP & BAN CHẤP HÀNH CHI ĐOÀN</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Nhiệm kỳ năm học 2026 - 2027</p>
    </div>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">STT</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Tổ chức</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Chức vụ</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Họ và tên học sinh</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Nhiệm vụ phụ trách</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Số điện thoại</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">1</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0369a1;">Ban Cán Sự</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Lớp trưởng</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Nguyễn Văn An</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Điều hành chung lớp học, liên hệ GVCN & BGH</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0987.654.321</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">2</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #d97706;">Chi Đoàn</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Bí thư Chi đoàn</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Trần Thị Bích</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Phong trào Đoàn, thanh niên, thi đua tuần</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0912.345.678</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">3</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0369a1;">Ban Cán Sự</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Lớp phó Học tập</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Lê Hoàng Cường</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Kiểm tra sổ đầu bài, đôn đốc học tập</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0978.112.233</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">4</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0369a1;">Ban Cán Sự</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Lớp phó Lao động</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Phạm Minh Đức</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Phân công trực nhật, vệ sinh lớp và trường</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0965.443.322</td>
        </tr>
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 35px;">
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">BÍ THƯ CHI ĐOÀN</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký tên)</p>
      </div>
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">LỚP TRƯỞNG</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký tên)</p>
      </div>
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">GIÁO VIÊN CHỦ NHIỆM</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký duyệt)</p>
      </div>
    </div>
  `;

  return (
    <ModuleWordEditor
      moduleId="canbo"
      moduleTitle="DANH SÁCH CÁN BỘ LỚP & CÁN BỘ ĐOÀN"
      moduleDesc={`Cán sự lớp và BCH Chi đoàn ${currentLop} • Soạn thảo Word (.docx) • Đồng bộ MySQL`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Can_Bo_Lop_Doan_${currentLop}`}
    />
  );
}

// 4. SƠ ĐỒ LỚP HỌC & CHIA TỔ (WORD RICH-TEXT EDITOR)
export function SoDoLopHoc({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">SƠ ĐỒ BỐ TRÍ CHỖ NGỒI & PHÂN CHIA TỔ HỌC TẬP</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Lớp: ${currentLop} • Trường THPT Phù Cừ • Năm học 2026 - 2027</p>
    </div>

    <div style="border: 2px dashed #0284c7; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 16px; background-color: #f0f9ff; color: #0369a1;">
      BÀN GIÁO VIÊN & BẢNG TỪ LỚP HỌC (HƯỚNG NHÌN TỪ TRÊN XUỐNG)
    </div>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 25%; font-weight: bold; color: #0284c7;">TỔ 1 (DÃY 1)</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 25%; font-weight: bold; color: #0284c7;">TỔ 2 (DÃY 2)</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 25%; font-weight: bold; color: #0284c7;">TỔ 3 (DÃY 3)</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 25%; font-weight: bold; color: #0284c7;">TỔ 4 (DÃY 4)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top;">
            <p style="font-weight: bold; color: #b45309;">1. Nguyễn Văn An (Tổ trưởng)</p>
            <p>2. Trần Thị Bích</p>
            <p>3. Vũ Quốc Đạt</p>
            <p>4. Đặng Thị Hà</p>
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top;">
            <p style="font-weight: bold; color: #b45309;">1. Lê Hoàng Cường (Tổ trưởng)</p>
            <p>2. Phạm Minh Đức</p>
            <p>3. Đỗ Thị Hạnh</p>
            <p>4. Bùi Quang Khải</p>
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top;">
            <p style="font-weight: bold; color: #b45309;">1. Hoàng Thuỳ Dung (Tổ trưởng)</p>
            <p>2. Nguyễn Gia Khiêm</p>
            <p>3. Mai Tuấn Long</p>
            <p>4. Ngô Phương Linh</p>
          </td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; vertical-align: top;">
            <p style="font-weight: bold; color: #b45309;">1. Đinh Văn Nam (Tổ trưởng)</p>
            <p>2. Tạ Thị Nga</p>
            <p>3. Phan Đình Phùng</p>
            <p>4. Lương Thảo Quỳnh</p>
          </td>
        </tr>
      </tbody>
    </table>

    <p style="font-style: italic; color: #64748b;">* Lưu ý: Học sinh ngồi đúng vị trí quy định, luân chuyển bàn ghế định kỳ 2 tuần/lần theo chiều kim đồng hồ để bảo vệ thị lực.</p>
  `;

  return (
    <ModuleWordEditor
      moduleId="sodo"
      moduleTitle="SƠ ĐỒ LỚP HỌC & CHIA TỔ"
      moduleDesc={`Bố trí chỗ ngồi và 4 tổ học tập lớp ${currentLop} • Soạn thảo Word • Tự động lưu MySQL`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`So_Do_Lop_Hoc_${currentLop}`}
    />
  );
}

// =========================================================================
// PHÂN HỆ 2: NỀ NẾP & HỌC TẬP (4 MODULES)
// =========================================================================

// 5. THỜI KHÓA BIỂU 2 BUỔI (WORD RICH-TEXT EDITOR)
export function ThoiKhoaBieu({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-weight: bold; text-transform: uppercase;">TRƯỜNG THPT PHÙ CỪ • NĂM HỌC 2026 - 2027</p>
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; color: #0284c7;">THỜI KHÓA BIỂU HỌC TẬP 2 BUỔI</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Áp dụng cho Lớp: ${currentLop}</p>
    </div>

    <h2 style="font-size: 14px; font-weight: bold; color: #0369a1; margin-bottom: 8px;">1. LỊCH HỌC BUỔI SÁNG (CHÍNH KHÓA)</h2>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 65px;">Tiết</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 2</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 3</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 4</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 5</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 6</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 7</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tiết 1</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Chào cờ</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Toán</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Ngữ văn</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Tiếng Anh</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Lịch sử</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Toán</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tiết 2</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Sinh hoạt</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Toán</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Ngữ văn</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Tiếng Anh</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Địa lý</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Vật lý</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tiết 3</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Ngữ văn</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Vật lý</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Hóa học</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Tin học</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">GDCD</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Hóa học</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tiết 4</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Toán</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Hóa học</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Sinh học</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thể dục</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Công nghệ</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Tiếng Anh</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tiết 5</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Tiếng Anh</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Sinh học</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Lịch sử</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thể dục</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Quốc phòng</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #b45309;">Sinh hoạt lớp</td></tr>
      </tbody>
    </table>

    <h2 style="font-size: 14px; font-weight: bold; color: #0369a1; margin-bottom: 8px;">2. LỊCH HỌC BUỔI CHIỀU (TĂNG TIẾT & BỒI DƯỠNG)</h2>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 65px;">Tiết</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 2</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 3</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 4</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 5</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thứ 6</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tiết 1</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Bồi dưỡng Toán</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Phụ đạo Văn</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Bồi dưỡng Anh</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Ôn tập KHTN</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">-</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tiết 2</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Bồi dưỡng Toán</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Phụ đạo Văn</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Bồi dưỡng Anh</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Ôn tập KHXH</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">-</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tiết 3</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Hoạt động trải nghiệm</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Thể thao / CLB</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">-</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">-</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">-</td></tr>
      </tbody>
    </table>
  `;

  return (
    <ModuleWordEditor
      moduleId="tkb"
      moduleTitle="THỜI KHÓA BIỂU 2 BUỔI"
      moduleDesc={`Lịch học chính khóa và buổi 2 lớp ${currentLop} • Soạn thảo Word (.docx) • Lưu MySQL`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Thoi_Khoa_Bieu_${currentLop}`}
    />
  );
}

// 6. THEO DÕI HỌC TẬP VÀ RÈN LUYỆN (WORD RICH-TEXT EDITOR)
export function TheoDoiHocTap({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">SỔ THEO DÕI HỌC TẬP VÀ RÈN LUYỆN HẰNG NGÀY</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Lớp: ${currentLop} • Trường THPT Phù Cừ</p>
    </div>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">STT</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Ngày</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Họ và tên học sinh</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Môn học</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Điểm / Nhận xét của GVBM</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Vi phạm / Khen thưởng</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">1</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">22/09/2026</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Nguyễn Văn An</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Toán</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Điểm 10 miệng, hăng hái phát biểu</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; color: #059669; font-weight: bold;">Tuyên dương trước lớp</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">2</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">23/09/2026</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Lê Hoàng Cường</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Vật lý</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Điểm 9 kiểm tra 15 phút</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; color: #059669;">Làm bài tốt</td>
        </tr>
      </tbody>
    </table>
  `;

  return (
    <ModuleWordEditor
      moduleId="theodoi"
      moduleTitle="THEO DÕI HỌC TẬP & RÈN LUYỆN"
      moduleDesc={`Sổ ghi chép học tập, điểm số và khen thưởng lớp ${currentLop} • Word trực tiếp`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Theo_Doi_Hoc_Tap_${currentLop}`}
    />
  );
}

// 7. GIÁO DỤC HỌC SINH CẦN QUAN TÂM (CÁ BIỆT) (WORD RICH-TEXT EDITOR)
export function GiaoDucCaBiet({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; color: #b45309;">HỒ SƠ THEO DÕI & KẾ HOẠCH GIÁO DỤC HỌC SINH CẦN QUAN TÂM</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Lớp: ${currentLop} • Năm học 2026 - 2027</p>
    </div>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #fef3c7;">
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: center; width: 45px;">STT</th>
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: left;">Họ và tên học sinh</th>
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: left;">Biểu hiện hành vi cần uốn nắn</th>
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: left;">Biện pháp giáo dục của GVCN</th>
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: center;">Ý kiến phụ huynh</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">1</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Phạm Minh Đức</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Hay đi học muộn 10 phút vào tiết 1, quên vở bài tập</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Gặp riêng trao đổi, phân công bạn cùng bàn đôn đốc, gọi điện PHHS</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Gia đình cam kết nhắc nhở ngủ sớm</td>
        </tr>
      </tbody>
    </table>
  `;

  return (
    <ModuleWordEditor
      moduleId="cabiet"
      moduleTitle="KẾ HOẠCH GIÁO DỤC HỌC SINH CẦN QUAN TÂM"
      moduleDesc={`Nhật ký theo dõi, uốn nắn hành vi học sinh lớp ${currentLop} • Soạn thảo Word`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Giao_Duc_Hoc_Sinh_${currentLop}`}
    />
  );
}

// 8. NỘI DUNG SINH HOẠT LỚP (WORD RICH-TEXT EDITOR)
export function SinhHoatLop({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">BIÊN BẢN NỘI DUNG SINH HOẠT LỚP HẰNG TUẦN</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Lớp: ${currentLop} • Tuần 4 (Từ 22/09/2026 đến 27/09/2026)</p>
    </div>

    <h2 style="font-size: 15px; font-weight: bold; color: #0369a1;">I. ĐÁNH GIÁ TÌNH HÌNH TUẦN QUA</h2>
    <p>1. <b>Nề nếp:</b> 100% học sinh mặc đồng phục đúng quy định. Không có hiện tượng sử dụng điện thoại trong giờ học.</p>
    <p>2. <b>Học tập:</b> Đạt 15 điểm giỏi ở các môn Toán, Lý, Hoá. Một số em còn chưa tích cực phát biểu ở môn Tiếng Anh.</p>
    <p>3. <b>Vệ sinh:</b> Tổ 2 trực nhật sạch sẽ, đổ rác đúng nơi quy định.</p>

    <h2 style="font-size: 15px; font-weight: bold; color: #0369a1; margin-top: 16px;">II. PHƯƠNG HƯỚNG TUẦN TỚI</h2>
    <p>1. Tăng cường ôn tập chuẩn bị kiểm tra định kỳ giữa học kỳ I.</p>
    <p>2. Đoàn thanh niên phát động phong trào thi đua chào mừng ngày Nhà giáo Việt Nam 20/11.</p>
    <p>3. Duy trì sĩ số, tuyệt đối chấp hành luật giao thông khi đi xe đạp điện tới trường.</p>

    <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 35px;">
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">THƯ KÝ LỚP</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký tên)</p>
      </div>
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">GIÁO VIÊN CHỦ NHIỆM</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký duyệt)</p>
      </div>
    </div>
  `;

  return (
    <ModuleWordEditor
      moduleId="sinhhoat"
      moduleTitle="NỘI DUNG SINH HOẠT LỚP HẰNG TUẦN"
      moduleDesc={`Biên bản họp và phương hướng sinh hoạt lớp ${currentLop} • Soạn thảo Word`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Bien_Ban_Sinh_Hoat_${currentLop}`}
    />
  );
}

// =========================================================================
// PHÂN HỆ 3: ĐÁNH GIÁ & KIỂM ĐỊNH (4 MODULES)
// =========================================================================

// 9. TỔNG HỢP XẾP LOẠI THEO THÔNG TƯ 22 (WORD RICH-TEXT EDITOR)
export function DanhGiaTT22({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; color: #0284c7;">BẢNG TỔNG HỢP ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN VÀ HỌC TẬP</h1>
      <p style="font-weight: bold; font-size: 13px; color: #0f172a;">THEO QUY CHUẨN THÔNG TƯ 22/2021/TT-BGDĐT</p>
      <p style="font-style: italic; color: #64748b; font-size: 12px;">Lớp: ${currentLop} • Trường THPT Phù Cừ</p>
    </div>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">STT</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Họ và tên học sinh</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Học tập HK1</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Rèn luyện HK1</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Học tập Cả năm</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Rèn luyện Cả năm</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Danh hiệu thi đua</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">1</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Nguyễn Văn An</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #059669; font-weight: bold;">Tốt</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #059669; font-weight: bold;">Tốt</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #059669; font-weight: bold;">Tốt</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #059669; font-weight: bold;">Tốt</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #d97706;">Học sinh Xuất sắc</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">2</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Trần Thị Bích</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #0284c7; font-weight: bold;">Khá</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #059669; font-weight: bold;">Tốt</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #0284c7; font-weight: bold;">Khá</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #059669; font-weight: bold;">Tốt</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0284c7;">Học sinh Giỏi</td>
        </tr>
      </tbody>
    </table>
  `;

  return (
    <ModuleWordEditor
      moduleId="tt22"
      moduleTitle="TỔNG HỢP XẾP LOẠI THÔNG TƯ 22/2021"
      moduleDesc={`Bảng xếp loại học lực & rèn luyện lớp ${currentLop} theo Thông tư 22 • Word (.docx)`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Tong_Hop_Danh_Gia_TT22_${currentLop}`}
    />
  );
}

// 10. THI ĐUA NỀ NẾP ĐOÀN TRƯỜNG (WORD RICH-TEXT EDITOR)
export function ThiDuaLop({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; color: #d97706;">BẢNG THEO DÕI XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Lớp: ${currentLop} • Điểm xuất phát: 100 điểm</p>
    </div>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #fef3c7;">
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: center; width: 60px;">Tuần</th>
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: center;">Điểm đạt</th>
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: center;">Hạng Khối</th>
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: center;">Hạng Toàn trường</th>
          <th style="padding: 8px; border: 1px solid #fde68a; text-align: center;">Cờ thi đua / Xếp loại</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tuần 1</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #059669;">98 đ</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">1/7</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">2/21</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #d97706;">Cờ Nhất Khối</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Tuần 2</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #059669;">96 đ</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">2/7</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">3/21</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0284c7;">Cờ Nhì Khối</td>
        </tr>
      </tbody>
    </table>
  `;

  return (
    <ModuleWordEditor
      moduleId="thidua"
      moduleTitle="XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG"
      moduleDesc={`Bảng điểm và thứ hạng thi đua nề nếp lớp ${currentLop} • Soạn thảo Word`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Xep_Loai_Thi_Dua_${currentLop}`}
    />
  );
}

// 11. BIÊN BẢN BÀN GIAO NGHỈ TẾT & HÈ (WORD RICH-TEXT EDITOR)
export function BienBanBanGiao({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
      <p style="font-weight: bold; margin-bottom: 10px;">Độc lập - Tự do - Hạnh phúc</p>
      <p style="margin-bottom: 12px;">------------------------</p>
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">BIÊN BẢN BÀN GIAO HỌC SINH NGHỈ TẾT VÀ SINH HOẠT HÈ</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Lớp: ${currentLop} • Trường THPT Phù Cừ</p>
    </div>

    <p style="line-height: 1.6; margin-bottom: 10px;">Hôm nay, ngày 20 tháng 01 năm 2026, tại văn phòng trường THPT Phù Cừ, chúng tôi gồm có:</p>
    <p>1. <b>Đại diện nhà trường:</b> Thầy/Cô GVCN Lớp ${currentLop}.</p>
    <p>2. <b>Đại diện chính quyền địa phương:</b> Ban Chấp hành Đoàn xã / Đoàn thị trấn.</p>

    <h2 style="font-size: 15px; font-weight: bold; color: #0369a1; margin-top: 16px;">NỘI DUNG BÀN GIAO:</h2>
    <p>1. Tổng số học sinh bàn giao về địa phương quản lý: <b>${classData?.totalStudents || 42} học sinh</b>.</p>
    <p>2. Cam kết chấp hành 100% luật An toàn giao thông, không tàng trữ, buôn bán hoặc sử dụng các loại pháo nổ trái phép.</p>
    <p>3. Tích cực tham gia các phong trào tình nguyện, giữ gìn vệ sinh môi trường và văn minh nơi cư trú.</p>

    <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 35px;">
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">ĐẠI DIỆN ĐỊA PHƯƠNG</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký tên, đóng dấu)</p>
      </div>
      <div>
        <p style="font-weight: bold; margin-bottom: 4px;">GIÁO VIÊN CHỦ NHIỆM</p>
        <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký và ghi rõ họ tên)</p>
      </div>
    </div>
  `;

  return (
    <ModuleWordEditor
      moduleId="bangiao"
      moduleTitle="BIÊN BẢN BÀN GIAO NGHỈ TẾT & SINH HOẠT HÈ"
      moduleDesc={`Bàn giao học sinh về gia đình & địa phương lớp ${currentLop} • Word (.docx)`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`Bien_Ban_Ban_Giao_${currentLop}`}
    />
  );
}

// 12. BGH KIỂM TRA & NHẬN XÉT SỔ (WORD RICH-TEXT EDITOR)
export function KiemTraBGH({ maLop, classData }) {
  const currentLop = maLop || classData?.className || '10A1';

  const defaultHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">SỞ GIÁO DỤC VÀ ĐÀO TẠO HƯNG YÊN</p>
      <p style="font-weight: bold; margin-bottom: 10px; text-transform: uppercase; color: #0284c7;">TRƯỜNG THPT PHÙ CỪ</p>
      <p style="margin-bottom: 12px;">------------------------</p>
      <h1 style="font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">Ý KIẾN KIỂM TRA & NHẬN XÉT SỔ CỦA BAN GIÁM HIỆU</h1>
      <p style="font-style: italic; color: #64748b; font-size: 13px;">Hồ sơ công tác chủ nhiệm lớp: ${currentLop}</p>
    </div>

    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">STT</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Đợt kiểm tra</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Ngày duyệt</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Ý kiến nhận xét, chỉ đạo của Ban Giám Hiệu</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Xếp loại</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">1</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Kiểm tra Đầu năm</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">15/09/2026</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Hồ sơ sơ yếu lý lịch đầy đủ, phân chia tổ lớp khoa học, kế hoạch chi tiết</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #059669;">Tốt</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">2</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">Sơ kết Học kỳ I</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">15/01/2027</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">Thực hiện nề nếp tốt, cập nhật điểm Thông tư 22 chính xác và kịp thời</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #059669;">Tốt</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: right; margin-top: 30px; padding-right: 40px;">
      <p style="font-weight: bold; margin-bottom: 4px;">HIỆU TRƯỞNG / PHÓ HIỆU TRƯỞNG</p>
      <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký tên và đóng dấu)</p>
    </div>
  `;

  return (
    <ModuleWordEditor
      moduleId="bgh"
      moduleTitle="BGH KIỂM TRA & NHẬN XÉT SỔ CHỦ NHIỆM"
      moduleDesc={`Ý kiến phê duyệt hồ sơ từ Ban Giám Hiệu • Lớp ${currentLop} • Word trực tiếp`}
      maLop={currentLop}
      defaultHtml={defaultHtml}
      exportFileName={`BGH_Kiem_Tra_So_${currentLop}`}
    />
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