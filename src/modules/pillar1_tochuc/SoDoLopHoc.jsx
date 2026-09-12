import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function SoDoLopHoc() {
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