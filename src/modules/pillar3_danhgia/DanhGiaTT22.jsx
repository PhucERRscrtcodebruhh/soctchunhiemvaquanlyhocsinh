import React from 'react';
import ModuleContainer from '../../components/ModuleContainer';

export default function DanhGiaTT22() {
  return (
    <ModuleContainer title="TỔNG HỢP XẾP LOẠI HỌC SINH THEO THÔNG TƯ 22" desc="Đánh giá kết quả Rèn luyện và Học tập học kỳ / cả năm">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
          <tr>
            <th className="p-3">STT</th><th className="p-3">Họ và tên</th><th className="p-3">Học tập HK1</th>
            <th className="p-3">Rèn luyện HK1</th><th className="p-3">Học tập Cả năm</th><th className="p-3">Danh hiệu</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-800 text-center text-slate-500">
            <td colSpan="6" className="py-12">Chưa có kết quả tổng hợp xếp loại</td>
          </tr>
        </tbody>
      </table>
    </ModuleContainer>
  );
}