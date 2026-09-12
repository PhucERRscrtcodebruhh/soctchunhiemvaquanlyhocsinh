import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function ThoiKhoaBieu() {
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