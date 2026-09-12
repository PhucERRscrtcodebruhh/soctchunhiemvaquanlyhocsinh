import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function CanBoLopDoan() {
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