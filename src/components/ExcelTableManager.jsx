import React, { useMemo } from 'react';
import ExcelSpreadsheetEditor from './ExcelSpreadsheetEditor';

export default function ExcelTableManager({ 
  defaultColumns = [], 
  defaultRows = [], 
  exportFileName = "bang-du-lieu", 
  emptyNotice = "Chưa có dữ liệu bảng",
  maLop = "10A1",
  title = "QUẢN LÝ BẢNG TÍNH EXCEL"
}) {
  // Construct initial 2D array if defaultColumns or defaultRows provided
  const initialGrid = useMemo(() => {
    if (defaultColumns.length === 0 && defaultRows.length === 0) {
      return null;
    }
    const grid = [];
    if (defaultColumns.length > 0) {
      grid.push(defaultColumns);
    }
    if (defaultRows.length > 0) {
      defaultRows.forEach(r => grid.push(r));
    }
    return grid;
  }, [defaultColumns, defaultRows]);

  return (
    <div className="w-full">
      <ExcelSpreadsheetEditor
        initialData={initialGrid}
        defaultFileName={exportFileName}
        maLop={maLop}
        title={title}
      />
    </div>
  );
}