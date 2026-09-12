import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function KiemTraBGH() {
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