import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function BienBanBanGiao({ classData }) {
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