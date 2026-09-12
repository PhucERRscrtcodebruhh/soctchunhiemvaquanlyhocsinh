import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function TheoDoiHocTap() {
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