import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function SinhHoatLop() {
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