import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function ThiDuaLop() {
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