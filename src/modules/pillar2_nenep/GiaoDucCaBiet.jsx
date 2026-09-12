import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function GiaoDucCaBiet() {
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