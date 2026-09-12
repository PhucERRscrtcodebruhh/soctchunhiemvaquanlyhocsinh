import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function BanDaiDienPHHS() {
  return (
    <ModuleContainer title="BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH" desc="Danh sách Ban đại diện PHHS lớp nhiệm kỳ 2026 - 2027">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3">STT</th><th className="p-3">Họ và tên PHHS</th><th className="p-3">Phụ huynh của em</th>
            <th className="p-3">Chức vụ trong Ban</th><th className="p-3">Số điện thoại</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-800 text-center text-slate-500">
            <td colSpan="5" className="py-12">Chưa thiết lập ban đại diện cha mẹ học sinh</td>
          </tr>
        </tbody>
      </table>
    </ModuleContainer>
  );
}