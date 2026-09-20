import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  FileSpreadsheet, Hash, Calculator, HelpCircle, Columns, Rows
} from 'lucide-react';
import DocumentActionBar from './DocumentActionBar';

// Helper to convert column index (0 -> A, 1 -> B, 26 -> AA)
function getColumnLetter(colIndex) {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

// Helper to parse cell address like 'A1' or 'B3' into { r, c }
function parseCellAddress(addr) {
  const match = addr.toUpperCase().trim().match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const colStr = match[1];
  const rowNum = parseInt(match[2], 10) - 1;
  let c = 0;
  for (let i = 0; i < colStr.length; i++) {
    c = c * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { r: rowNum, c: c - 1 };
}

// Formula Evaluation Engine for Basic Spreadsheet Calculations
function evaluateFormula(formulaStr, sheetRows) {
  if (typeof formulaStr !== 'string' || !formulaStr.startsWith('=')) {
    return formulaStr;
  }

  const expr = formulaStr.slice(1).trim().toUpperCase();

  try {
    // 1. Check Range Functions: SUM(A1:A5), AVERAGE(A1:A5), COUNT, MAX, MIN
    const funcMatch = expr.match(/^(SUM|AVERAGE|COUNT|MAX|MIN)\(([^)]+)\)$/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      const argsStr = funcMatch[2];
      const numbers = [];

      const parts = argsStr.split(',').map(p => p.trim());
      for (const part of parts) {
        if (part.includes(':')) {
          // Range A1:B3
          const [startStr, endStr] = part.split(':');
          const start = parseCellAddress(startStr);
          const end = parseCellAddress(endStr);
          if (start && end) {
            const minR = Math.min(start.r, end.r);
            const maxR = Math.max(start.r, end.r);
            const minC = Math.min(start.c, end.c);
            const maxC = Math.max(start.c, end.c);
            for (let r = minR; r <= maxR; r++) {
              for (let c = minC; c <= maxC; c++) {
                const cellVal = sheetRows[r]?.[c];
                const num = parseFloat(cellVal);
                if (!isNaN(num)) numbers.push(num);
              }
            }
          }
        } else {
          // Single cell or number
          const addr = parseCellAddress(part);
          if (addr) {
            const num = parseFloat(sheetRows[addr.r]?.[addr.c]);
            if (!isNaN(num)) numbers.push(num);
          } else {
            const num = parseFloat(part);
            if (!isNaN(num)) numbers.push(num);
          }
        }
      }

      if (funcName === 'SUM') {
        return numbers.reduce((acc, val) => acc + val, 0);
      }
      if (funcName === 'AVERAGE') {
        return numbers.length ? (numbers.reduce((acc, val) => acc + val, 0) / numbers.length).toFixed(2) : 0;
      }
      if (funcName === 'COUNT') {
        return numbers.length;
      }
      if (funcName === 'MAX') {
        return numbers.length ? Math.max(...numbers) : 0;
      }
      if (funcName === 'MIN') {
        return numbers.length ? Math.min(...numbers) : 0;
      }
    }

    // 2. Simple arithmetic like =A1+B1 or =A1*2 or =A1-B2 or =A1/C1
    // Replace cell references with their numeric values
    let evalStr = expr.replace(/[A-Z]+[0-9]+/g, (match) => {
      const addr = parseCellAddress(match);
      if (addr) {
        const val = parseFloat(sheetRows[addr.r]?.[addr.c]);
        return isNaN(val) ? 0 : val;
      }
      return 0;
    });

    // Sanitized eval using Function for safety
    if (/^[0-9+\-*/().\s]+$/.test(evalStr)) {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${evalStr}`)();
      return typeof result === 'number' && !isNaN(result) 
        ? (Number.isInteger(result) ? result : parseFloat(result.toFixed(2))) 
        : '#ERR';
    }

    return '#FORMULA?';
  } catch (err) {
    return '#ERROR';
  }
}

export default function ExcelSpreadsheetEditor({
  initialSheets = null,
  initialData = null, // fallback 2D array if simple
  defaultFileName = 'Bang_Tinh_Hoc_Sinh',
  maLop = '10A1',
  onSaveToBackend = null,
  title = "BẢNG TÍNH EXCEL TRỰC TUYẾN"
}) {
  // Normalize initialSheets: { Sheet1: [ [...] ] }
  const createDefaultSheets = () => {
    if (initialSheets && Object.keys(initialSheets).length > 0) {
      return initialSheets;
    }
    if (initialData && Array.isArray(initialData) && initialData.length > 0) {
      return { "Sheet1": initialData };
    }
    return {
      "Sheet1": [
        ["STT", "Họ và Tên", "Điểm Toán", "Điểm Văn", "Điểm Anh", "Điểm TB", "Xếp Loại"],
        ["1", "Nguyễn Văn An", 8.5, 7.5, 9.0, "=AVERAGE(C2:E2)", "Giỏi"],
        ["2", "Trần Thị Bích", 7.0, 8.0, 7.5, "=AVERAGE(C3:E3)", "Khá"],
        ["3", "Lê Hoàng Cường", 9.0, 9.5, 8.5, "=AVERAGE(C4:E4)", "Xuất sắc"],
        ["4", "Phạm Minh Đức", 6.0, 6.5, 7.0, "=AVERAGE(C5:E5)", "Đạt"],
        ["Tổng cộng", "=COUNT(B2:B5) em", "=SUM(C2:C5)", "=SUM(D2:D5)", "=SUM(E2:E5)", "", ""]
      ],
      "Sheet2": [
        ["Mục chi", "Dự kiến (VNĐ)", "Thực chi (VNĐ)", "Chênh lệch"],
        ["Quỹ lớp kỳ 1", 2000000, 1850000, "=B2-C2"],
        ["Hoạt động 20/11", 1500000, 1600000, "=B3-C3"],
        ["Khen thưởng HSG", 1000000, 900000, "=B4-C4"],
        ["Tổng chi", "=SUM(B2:B4)", "=SUM(C2:C4)", "=SUM(D2:D4)"]
      ]
    };
  };

  const [sheets, setSheets] = useState(createDefaultSheets);
  const [sheetNames, setSheetNames] = useState(() => Object.keys(createDefaultSheets()));
  const [activeSheet, setActiveSheet] = useState(() => sheetNames[0] || "Sheet1");
  const [fileName, setFileName] = useState(defaultFileName);
  
  // Selection and inline editing state
  const [selectedCell, setSelectedCell] = useState({ r: 0, c: 0 });
  const [editingCell, setEditingCell] = useState(null); // { r, c }
  const [cellInput, setCellInput] = useState('');
  
  // Status states
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

  const cellInputRef = useRef(null);
  const formulaInputRef = useRef(null);

  // Active Sheet Grid Rows
  const currentGrid = useMemo(() => {
    return sheets[activeSheet] || [[""]];
  }, [sheets, activeSheet]);

  // Max rows and columns for rendering
  const totalRows = Math.max(currentGrid.length, 15);
  const totalCols = Math.max(
    ...currentGrid.map(r => (Array.isArray(r) ? r.length : 0)),
    8
  );

  // Update formula bar input when selectedCell changes
  useEffect(() => {
    if (selectedCell) {
      const rawVal = currentGrid[selectedCell.r]?.[selectedCell.c] ?? '';
      setCellInput(String(rawVal));
    }
  }, [selectedCell, currentGrid]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
    }
  }, [editingCell]);

  // Commit cell changes
  const handleCommitValue = (val) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;

    setSheets(prev => {
      const currentRows = prev[activeSheet] ? [...prev[activeSheet]] : [];
      // Ensure row exists
      while (currentRows.length <= r) {
        currentRows.push([]);
      }
      const updatedRow = [...(currentRows[r] || [])];
      // Ensure col exists
      while (updatedRow.length <= c) {
        updatedRow.push('');
      }

      // Convert to number if numeric and not formula
      let finalVal = val;
      if (typeof val === 'string' && val.trim() !== '' && !val.startsWith('=')) {
        const num = Number(val);
        if (!isNaN(num)) finalVal = num;
      }

      updatedRow[c] = finalVal;
      currentRows[r] = updatedRow;
      return { ...prev, [activeSheet]: currentRows };
    });

    setIsDirty(true);
    setEditingCell(null);
  };

  // Keyboard navigation on cells
  const handleKeyDown = (e) => {
    if (!selectedCell) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingCell) {
        handleCommitValue(cellInput);
      }
      // Move down
      setSelectedCell(prev => ({ ...prev, r: Math.min(prev.r + 1, totalRows - 1) }));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (editingCell) {
        handleCommitValue(cellInput);
      }
      // Move right (or left if Shift+Tab)
      if (e.shiftKey) {
        setSelectedCell(prev => ({ ...prev, c: Math.max(prev.c - 1, 0) }));
      } else {
        setSelectedCell(prev => ({ ...prev, c: Math.min(prev.c + 1, totalCols - 1) }));
      }
    } else if (e.key === 'Escape') {
      if (editingCell) {
        setEditingCell(null);
        setCellInput(String(currentGrid[selectedCell.r]?.[selectedCell.c] ?? ''));
      }
    } else if (!editingCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Start typing directly to edit
      setEditingCell({ ...selectedCell });
      setCellInput(e.key);
    }
  };

  // Row operations
  const handleAddRow = () => {
    setSheets(prev => {
      const currentRows = [...(prev[activeSheet] || [])];
      const targetIndex = selectedCell ? selectedCell.r + 1 : currentRows.length;
      const newRow = new Array(totalCols).fill('');
      currentRows.splice(targetIndex, 0, newRow);
      return { ...prev, [activeSheet]: currentRows };
    });
    setIsDirty(true);
  };

  const handleDeleteRow = () => {
    if (!selectedCell || currentGrid.length <= 1) return;
    setSheets(prev => {
      const currentRows = [...(prev[activeSheet] || [])];
      currentRows.splice(selectedCell.r, 1);
      return { ...prev, [activeSheet]: currentRows };
    });
    setSelectedCell(prev => ({ ...prev, r: Math.max(0, prev.r - 1) }));
    setIsDirty(true);
  };

  // Column operations
  const handleAddCol = () => {
    setSheets(prev => {
      const currentRows = (prev[activeSheet] || []).map(row => {
        const targetIndex = selectedCell ? selectedCell.c + 1 : row.length;
        const newRow = [...row];
        newRow.splice(targetIndex, 0, '');
        return newRow;
      });
      return { ...prev, [activeSheet]: currentRows };
    });
    setIsDirty(true);
  };

  const handleDeleteCol = () => {
    if (!selectedCell || totalCols <= 1) return;
    setSheets(prev => {
      const currentRows = (prev[activeSheet] || []).map(row => {
        const newRow = [...row];
        newRow.splice(selectedCell.c, 1);
        return newRow;
      });
      return { ...prev, [activeSheet]: currentRows };
    });
    setSelectedCell(prev => ({ ...prev, c: Math.max(0, prev.c - 1) }));
    setIsDirty(true);
  };

  // Multi-Sheet Tabs Operations
  const handleAddSheet = () => {
    let nextNum = sheetNames.length + 1;
    let newName = `Sheet${nextNum}`;
    while (sheetNames.includes(newName)) {
      nextNum++;
      newName = `Sheet${nextNum}`;
    }
    setSheets(prev => ({
      ...prev,
      [newName]: [
        ["Tiêu đề A", "Tiêu đề B", "Tiêu đề C"],
        ["", "", ""]
      ]
    }));
    setSheetNames(prev => [...prev, newName]);
    setActiveSheet(newName);
    setIsDirty(true);
  };

  const handleDeleteSheet = (name) => {
    if (sheetNames.length <= 1) {
      alert("Không thể xóa sheet duy nhất trong bảng tính!");
      return;
    }
    if (!window.confirm(`Xác nhận xóa trang "${name}"?`)) return;

    setSheets(prev => {
      const nextSheets = { ...prev };
      delete nextSheets[name];
      return nextSheets;
    });

    const nextNames = sheetNames.filter(n => n !== name);
    setSheetNames(nextNames);
    if (activeSheet === name) {
      setActiveSheet(nextNames[0]);
    }
    setIsDirty(true);
  };

  const handleRenameSheet = (name) => {
    const newName = prompt(`Đổi tên trang tính "${name}" thành:`, name);
    if (!newName || newName.trim() === '' || newName === name) return;
    const clean = newName.trim();
    if (sheetNames.includes(clean)) {
      alert("Tên trang tính đã tồn tại!");
      return;
    }

    setSheets(prev => {
      const nextSheets = {};
      sheetNames.forEach(n => {
        if (n === name) {
          nextSheets[clean] = prev[name];
        } else {
          nextSheets[n] = prev[n];
        }
      });
      return nextSheets;
    });

    setSheetNames(prev => prev.map(n => n === name ? clean : n));
    if (activeSheet === name) setActiveSheet(clean);
    setIsDirty(true);
  };

  // 1. IMPORT EXCEL (.xlsx, .xls)
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedSheets = {};
        const importedNames = workbook.SheetNames;

        importedNames.forEach(sheetName => {
          const ws = workbook.Sheets[sheetName];
          const jsonAoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          importedSheets[sheetName] = jsonAoa.length > 0 ? jsonAoa : [[""]];
        });

        if (importedNames.length > 0) {
          setSheets(importedSheets);
          setSheetNames(importedNames);
          setActiveSheet(importedNames[0]);
          setFileName(file.name.replace(/\.[^/.]+$/, ""));
          setIsDirty(true);
          setSelectedCell({ r: 0, c: 0 });
          setToastMessage(`Đã nhập thành công ${importedNames.length} sheet từ tệp ${file.name}`);
        }
      } catch (err) {
        alert("Lỗi khi đọc file Excel: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Helper to compile to XLSX Workbook
  const generateWorkbook = () => {
    const wb = XLSX.utils.book_new();
    sheetNames.forEach(name => {
      const rows = sheets[name] || [[""]];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31)); // Excel limit 31 chars
    });
    return wb;
  };

  // 2. EXPORT EXCEL (.xlsx)
  const handleExportExcel = () => {
    try {
      const wb = generateWorkbook();
      const exportName = `${fileName || 'Bang_Tinh'}.xlsx`;
      XLSX.writeFile(wb, exportName);
      setToastMessage(`Đã xuất tệp Excel: ${exportName}`);
    } catch (err) {
      alert("Lỗi khi xuất Excel: " + err.message);
    }
  };

  // 3. PRIMARY ACTION: SAVE CHANGES
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Recompile in-memory sheets into Excel base64
      const wb = generateWorkbook();
      const wbBase64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

      // Save to backend API
      const res = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: `${fileName}.xlsx`,
          file_type: 'excel',
          file_data: wbBase64,
          ma_lop: maLop
        })
      });

      if (res.ok) {
        setIsDirty(false);
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        setLastSavedTime(timeStr);
        setToastMessage(`Đã lưu bảng tính thành công lúc ${timeStr}!`);
        if (onSaveToBackend) onSaveToBackend({ sheets, fileName });
      } else {
        throw new Error("Máy chủ phản hồi lỗi khi lưu.");
      }
    } catch (err) {
      // Fallback local storage if backend offline
      try {
        localStorage.setItem(`sotay_excel_${maLop}_${fileName}`, JSON.stringify(sheets));
        setIsDirty(false);
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        setLastSavedTime(timeStr);
        setToastMessage(`Đã lưu vào bộ nhớ cục bộ lúc ${timeStr}`);
      } catch (localErr) {
        alert("Lỗi lưu bảng tính: " + err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCellName = getColumnLetter(selectedCell.c) + (selectedCell.r + 1);

  return (
    <div className="space-y-3 font-sans" onKeyDown={handleKeyDown}>
      {/* 1. TOP ACTION BAR WITH SAVE / DIRTY INDICATOR */}
      <DocumentActionBar
        title={title}
        fileType="excel"
        isDirty={isDirty}
        isSaving={isSaving}
        lastSavedTime={lastSavedTime}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onSave={handleSaveChanges}
        onImportFile={handleImportExcel}
        onExportFile={handleExportExcel}
        acceptTypes=".xlsx, .xls"
        fileName={`${fileName}.xlsx`}
        toastMessage={toastMessage}
        extraControls={
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
            <button
              onClick={handleAddRow}
              type="button"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition flex items-center gap-1 text-[11px]"
              title="Thêm hàng mới"
            >
              <Rows className="w-3.5 h-3.5" /> +Hàng
            </button>
            <button
              onClick={handleDeleteRow}
              type="button"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-red-400 rounded transition flex items-center gap-1 text-[11px]"
              title="Xóa hàng đang chọn"
            >
              <Trash2 className="w-3.5 h-3.5" /> -Hàng
            </button>
            <span className="w-px h-3 bg-slate-800" />
            <button
              onClick={handleAddCol}
              type="button"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition flex items-center gap-1 text-[11px]"
              title="Thêm cột mới"
            >
              <Columns className="w-3.5 h-3.5" /> +Cột
            </button>
            <button
              onClick={handleDeleteCol}
              type="button"
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-red-400 rounded transition flex items-center gap-1 text-[11px]"
              title="Xóa cột đang chọn"
            >
              <Trash2 className="w-3.5 h-3.5" /> -Cột
            </button>
          </div>
        }
      />

      {/* 2. FORMULA BAR */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-1 text-slate-400 font-mono font-bold px-2 py-0.5 bg-slate-950 border border-slate-800 rounded min-w-[50px] text-center text-cyan-400">
          <Hash className="w-3 h-3 text-slate-500" />
          <span>{selectedCellName}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 font-mono italic text-[11px] px-1">
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>fx</span>
        </div>

        <input
          ref={formulaInputRef}
          type="text"
          value={cellInput}
          onChange={(e) => setCellInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommitValue(cellInput);
            }
          }}
          onBlur={() => {
            if (selectedCell && cellInput !== String(currentGrid[selectedCell.r]?.[selectedCell.c] ?? '')) {
              handleCommitValue(cellInput);
            }
          }}
          disabled={!isEditing}
          placeholder="Nhập giá trị hoặc công thức (ví dụ: =SUM(A1:A5), =AVERAGE(B2:D2), =A1+B1...)"
          className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-xs font-mono"
        />
      </div>

      {/* 3. INTERACTIVE SPREADSHEET GRID */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
        <div className="max-h-[500px] overflow-auto select-none">
          <table className="w-full border-collapse text-xs font-sans whitespace-nowrap">
            {/* Header row with column letters */}
            <thead className="sticky top-0 z-20 bg-slate-900 text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="w-12 min-w-[48px] p-2 border-b border-r border-slate-800 bg-slate-900 text-center font-bold text-slate-500 sticky left-0 z-30">
                  #
                </th>
                {Array.from({ length: totalCols }).map((_, cIdx) => (
                  <th
                    key={cIdx}
                    className={`min-w-[120px] max-w-[240px] px-3 py-1.5 border-b border-r border-slate-800 font-bold uppercase transition ${
                      selectedCell.c === cIdx ? 'bg-cyan-500/10 text-cyan-400' : ''
                    }`}
                  >
                    {getColumnLetter(cIdx)}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Grid rows and cells */}
            <tbody className="divide-y divide-slate-800/60">
              {Array.from({ length: totalRows }).map((_, rIdx) => {
                const isSelectedRow = selectedCell.r === rIdx;
                return (
                  <tr key={rIdx} className="hover:bg-slate-900/40">
                    {/* Row number header */}
                    <td
                      className={`w-12 min-w-[48px] p-1.5 border-r border-slate-800 font-mono text-center text-slate-500 sticky left-0 z-10 transition ${
                        isSelectedRow ? 'bg-cyan-500/15 text-cyan-400 font-bold' : 'bg-slate-900/90'
                      }`}
                    >
                      {rIdx + 1}
                    </td>

                    {/* Cells in row */}
                    {Array.from({ length: totalCols }).map((_, cIdx) => {
                      const isSelected = selectedCell.r === rIdx && selectedCell.c === cIdx;
                      const isEditingThis = editingCell && editingCell.r === rIdx && editingCell.c === cIdx;
                      const rawValue = currentGrid[rIdx]?.[cIdx] ?? '';
                      const displayValue = evaluateFormula(rawValue, currentGrid);
                      const isFormula = typeof rawValue === 'string' && rawValue.startsWith('=');

                      return (
                        <td
                          key={cIdx}
                          onClick={() => {
                            if (editingCell && (editingCell.r !== rIdx || editingCell.c !== cIdx)) {
                              handleCommitValue(cellInput);
                            }
                            setSelectedCell({ r: rIdx, c: cIdx });
                          }}
                          onDoubleClick={() => {
                            if (!isEditing) return;
                            setSelectedCell({ r: rIdx, c: cIdx });
                            setEditingCell({ r: rIdx, c: cIdx });
                            setCellInput(String(rawValue));
                          }}
                          className={`min-w-[120px] max-w-[240px] p-2 border-r border-slate-800/80 transition relative cursor-cell ${
                            isSelected
                              ? 'ring-2 ring-cyan-400 bg-cyan-500/10 z-10'
                              : 'hover:bg-slate-800/40 text-slate-200'
                          }`}
                        >
                          {isEditingThis ? (
                            <input
                              ref={cellInputRef}
                              type="text"
                              value={cellInput}
                              onChange={(e) => setCellInput(e.target.value)}
                              onBlur={() => handleCommitValue(cellInput)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommitValue(cellInput);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-full bg-slate-900 border border-cyan-400 text-white font-mono text-xs px-1.5 py-0.5 rounded outline-none shadow-lg"
                            />
                          ) : (
                            <div className="flex items-center justify-between overflow-hidden">
                              <span
                                className={`truncate ${
                                  isFormula ? 'font-semibold text-cyan-300' : ''
                                } ${typeof displayValue === 'number' ? 'font-mono text-right w-full' : ''}`}
                                title={isFormula ? `${rawValue} -> ${displayValue}` : String(displayValue)}
                              >
                                {displayValue !== undefined && displayValue !== null && String(displayValue) !== '' 
                                  ? String(displayValue) 
                                  : ''}
                              </span>
                              {isFormula && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1 shrink-0" title="Công thức tự động" />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. MULTI-SHEET TAB NAVIGATION BAR */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-t border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {sheetNames.map((name) => {
              const isActive = activeSheet === name;
              return (
                <div
                  key={name}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-semibold cursor-pointer border-t-2 transition ${
                    isActive
                      ? 'bg-slate-950 text-cyan-400 border-cyan-400 shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                  onClick={() => setActiveSheet(name)}
                  onDoubleClick={() => handleRenameSheet(name)}
                  title="Nhấn đúp để đổi tên trang tính"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{name}</span>

                  {sheetNames.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSheet(name);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition p-0.5"
                      title="Xóa trang tính"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add new sheet button */}
            <button
              onClick={handleAddSheet}
              type="button"
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
              title="Thêm trang tính mới (+ Sheet)"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {sheetNames.length} Sheets • {totalRows} hàng × {totalCols} cột
          </div>
        </div>
      </div>
    </div>
  );
}
