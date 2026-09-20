import React, { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import { 
  Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, 
  WidthType, AlignmentType, HeadingLevel, BorderStyle 
} from 'docx';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, Table as TableIcon,
  Heading1, Heading2, Heading3, Undo, Redo, FileText, Check, Plus, Trash2
} from 'lucide-react';
import DocumentActionBar from './DocumentActionBar';

// Default document HTML template for school work
const DEFAULT_WORD_HTML = `
<div style="text-align: center; margin-bottom: 24px;">
  <p style="font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">SỞ GIÁO DỤC VÀ ĐÀO TẠO HƯNG YÊN</p>
  <p style="font-weight: bold; margin-bottom: 12px; text-transform: uppercase; color: #0284c7;">TRƯỜNG THPT PHÙ CỪ</p>
  <p style="margin-bottom: 16px;">------------------------</p>
  <h1 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">KẾ HOẠCH CÔNG TÁC CHỦ NHIỆM & BÀN GIAO HỌC SINH</h1>
  <p style="font-style: italic; color: #64748b; font-size: 13px;">Năm học: 2026 - 2027 • Phân hệ Quản lý Điện tử</p>
</div>

<h2 style="font-size: 16px; font-weight: bold; color: #0369a1; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px;">I. MỤC TIÊU VÀ NHIỆM VỤ TRỌNG TÂM</h2>
<p style="line-height: 1.6; margin-bottom: 8px;">1. Quản lý toàn diện nề nếp, học tập và hạnh kiểm học sinh theo quy chuẩn Thông tư 22/2021/TT-BGDĐT.</p>
<p style="line-height: 1.6; margin-bottom: 8px;">2. Phối hợp chặt chẽ giữa Giáo viên chủ nhiệm, Ban đại diện Cha mẹ học sinh và Đoàn trường.</p>
<p style="line-height: 1.6; margin-bottom: 16px;">3. Đảm bảo an toàn giao thông, văn hoá học đường và chuyển đổi số trong hồ sơ sổ sách.</p>

<h2 style="font-size: 16px; font-weight: bold; color: #0369a1; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px;">II. DANH SÁCH BÀN GIAO BAN CÁN SỰ & CHIA TỔ</h2>
<table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px;" border="1">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; width: 50px;">STT</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Họ và Tên</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Chức Vụ</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Nhiệm Vụ Phụ Trách</th>
      <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Số Điện Thoại</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">1</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Nguyễn Văn An</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Lớp trưởng</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Quản lý chung & báo cáo GVCN</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0987.654.321</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">2</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Trần Thị Bích</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Bí thư Chi đoàn</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Phong trào Đoàn & thi đua tuần</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0912.345.678</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">3</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Lê Hoàng Cường</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Lớp phó Học tập</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Theo dõi điểm số & kiểm tra bài</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">0978.112.233</td>
    </tr>
  </tbody>
</table>

<h2 style="font-size: 16px; font-weight: bold; color: #0369a1; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px;">III. Ý KIẾN VÀ CHỮ KÝ XÁC NHẬN</h2>
<p style="line-height: 1.6; margin-bottom: 24px;">Biên bản được lập thành 02 bản có giá trị pháp lý như nhau, lưu vào sổ công tác chủ nhiệm điện tử của trường.</p>
<div style="display: flex; justify-content: space-around; text-align: center; margin-top: 30px;">
  <div>
    <p style="font-weight: bold; margin-bottom: 4px;">ĐẠI DIỆN ĐOÀN THỂ</p>
    <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký và ghi rõ họ tên)</p>
  </div>
  <div>
    <p style="font-weight: bold; margin-bottom: 4px;">GIÁO VIÊN CHỦ NHIỆM</p>
    <p style="font-style: italic; font-size: 11px; color: #64748b;">(Ký và ghi rõ họ tên)</p>
  </div>
</div>
`;

// Helper to convert HTML DOM into DOCX Document elements
function parseHtmlToDocxElements(containerNode) {
  const elements = [];
  const children = Array.from(containerNode.childNodes);

  for (const node of children) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push(new Paragraph({
          children: [new TextRun({ text })]
        }));
      }
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const tagName = node.tagName.toLowerCase();

    // 1. Headings
    if (['h1', 'h2', 'h3', 'h4'].includes(tagName)) {
      const headingMap = {
        h1: HeadingLevel.HEADING_1,
        h2: HeadingLevel.HEADING_2,
        h3: HeadingLevel.HEADING_3,
        h4: HeadingLevel.HEADING_4
      };
      const textRuns = extractTextRunsFromNode(node);
      elements.push(new Paragraph({
        heading: headingMap[tagName],
        children: textRuns.length ? textRuns : [new TextRun({ text: node.innerText || '' })],
        spacing: { before: 240, after: 120 }
      }));
      continue;
    }

    // 2. Tables
    if (tagName === 'table') {
      const rows = [];
      const trElements = Array.from(node.querySelectorAll('tr'));
      for (const tr of trElements) {
        const cells = [];
        const cellElements = Array.from(tr.querySelectorAll('th, td'));
        const isHeader = tr.parentElement?.tagName.toLowerCase() === 'thead' || tr.querySelector('th') !== null;

        for (const cell of cellElements) {
          const cellTextRuns = extractTextRunsFromNode(cell);
          cells.push(new TableCell({
            children: [
              new Paragraph({
                children: cellTextRuns.length ? cellTextRuns : [new TextRun({ text: cell.innerText?.trim() || '' })],
                alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT
              })
            ],
            shading: isHeader ? { fill: "F1F5F9" } : undefined
          }));
        }

        if (cells.length > 0) {
          rows.push(new TableRow({ children: cells }));
        }
      }

      if (rows.length > 0) {
        elements.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows
        }));
        elements.push(new Paragraph({ text: "", spacing: { after: 120 } }));
      }
      continue;
    }

    // 3. Lists (ul, ol)
    if (tagName === 'ul' || tagName === 'ol') {
      const liElements = Array.from(node.querySelectorAll('li'));
      liElements.forEach((li, idx) => {
        const prefix = tagName === 'ol' ? `${idx + 1}. ` : '• ';
        const textRuns = extractTextRunsFromNode(li);
        elements.push(new Paragraph({
          children: [
            new TextRun({ text: prefix, bold: true }),
            ...(textRuns.length ? textRuns : [new TextRun({ text: li.innerText || '' })])
          ],
          spacing: { after: 60 }
        }));
      });
      continue;
    }

    // 4. Paragraphs or Divs
    const textRuns = extractTextRunsFromNode(node);
    let align = AlignmentType.LEFT;
    const textAlign = node.style?.textAlign || node.getAttribute('align');
    if (textAlign === 'center') align = AlignmentType.CENTER;
    if (textAlign === 'right') align = AlignmentType.RIGHT;
    if (textAlign === 'justify') align = AlignmentType.JUSTIFIED;

    elements.push(new Paragraph({
      alignment: align,
      children: textRuns.length ? textRuns : [new TextRun({ text: node.innerText || '' })],
      spacing: { after: 100 }
    }));
  }

  return elements;
}

// Extract styled TextRuns from a DOM node
function extractTextRunsFromNode(node) {
  const runs = [];

  function traverse(n, inheritedStyles = {}) {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.textContent;
      if (text) {
        runs.push(new TextRun({
          text,
          bold: inheritedStyles.bold || false,
          italics: inheritedStyles.italics || false,
          underline: inheritedStyles.underline ? {} : undefined,
          strike: inheritedStyles.strike || false
        }));
      }
      return;
    }

    if (n.nodeType !== Node.ELEMENT_NODE) return;

    const tag = n.tagName.toLowerCase();
    const currentStyles = {
      ...inheritedStyles,
      bold: inheritedStyles.bold || ['strong', 'b', 'th'].includes(tag) || n.style?.fontWeight === 'bold',
      italics: inheritedStyles.italics || ['em', 'i'].includes(tag) || n.style?.fontStyle === 'italic',
      underline: inheritedStyles.underline || ['u'].includes(tag) || n.style?.textDecoration?.includes('underline'),
      strike: inheritedStyles.strike || ['s', 'strike', 'del'].includes(tag) || n.style?.textDecoration?.includes('line-through')
    };

    for (const child of Array.from(n.childNodes)) {
      traverse(child, currentStyles);
    }
  }

  traverse(node);
  return runs;
}

export default function WordDocumentEditor({
  initialHtml = null,
  defaultFileName = 'Van_Ban_Hoc_Sinh',
  maLop = '10A1',
  onSaveToBackend = null,
  title = "SOẠN THẢO VĂN BẢN WORD (.DOCX)"
}) {
  const [docHtml, setDocHtml] = useState(initialHtml || DEFAULT_WORD_HTML);
  const [fileName, setFileName] = useState(defaultFileName);
  
  // Status states
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

  // Table insert modal / state
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 4 });

  const editorRef = useRef(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && docHtml) {
      editorRef.current.innerHTML = docHtml;
    }
  }, []);

  // Sync edits from contentEditable
  const handleEditorInput = () => {
    if (editorRef.current) {
      setDocHtml(editorRef.current.innerHTML);
      setIsDirty(true);
    }
  };

  // Execute formatting commands
  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  // Insert Table
  const handleInsertTable = (rowsCount, colsCount) => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;" border="1"><thead><tr style="background-color: #f1f5f9;">`;
    for (let c = 0; c < colsCount; c++) {
      tableHtml += `<th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Cột ${c + 1}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 0; r < rowsCount; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < colsCount; c++) {
        tableHtml += `<td style="padding: 8px; border: 1px solid #cbd5e1;">Nội dung ${r + 1},${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    execFormat('insertHTML', tableHtml);
    setShowTableModal(false);
  };

  // Table row/col actions
  const handleAddTableRow = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;
    const cell = sel.anchorNode.nodeType === Node.ELEMENT_NODE 
      ? sel.anchorNode.closest('td, th') 
      : sel.anchorNode.parentElement?.closest('td, th');
    const row = cell?.closest('tr');
    if (!row) {
      alert("Vui lòng đặt con trỏ chuột vào một ô trong bảng để thêm hàng!");
      return;
    }
    const colsCount = row.querySelectorAll('td, th').length;
    const newTr = document.createElement('tr');
    for (let i = 0; i < colsCount; i++) {
      const td = document.createElement('td');
      td.style.padding = '8px';
      td.style.border = '1px solid #cbd5e1';
      td.innerHTML = '&nbsp;';
      newTr.appendChild(td);
    }
    row.after(newTr);
    handleEditorInput();
  };

  const handleDeleteTableRow = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;
    const cell = sel.anchorNode.nodeType === Node.ELEMENT_NODE 
      ? sel.anchorNode.closest('td, th') 
      : sel.anchorNode.parentElement?.closest('td, th');
    const row = cell?.closest('tr');
    if (!row) {
      alert("Vui lòng đặt con trỏ chuột vào hàng cần xóa!");
      return;
    }
    row.remove();
    handleEditorInput();
  };

  // 1. IMPORT WORD (.docx)
  const handleImportWord = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target.result;
        // Mammoth converts .docx to HTML preserving headings, tables, lists, text formatting
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value || "<p>Văn bản trống</p>";

        setDocHtml(html);
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
        }
        setFileName(file.name.replace(/\.[^/.]+$/, ""));
        setIsDirty(true);
        setToastMessage(`Đã nhập thành công văn bản Word: ${file.name}`);
      } catch (err) {
        alert("Lỗi khi đọc file Word: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Helper to compile HTML into genuine DOCX Document
  const compileHtmlToDocxBlob = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current ? editorRef.current.innerHTML : docHtml;

    const docElements = parseHtmlToDocxElements(tempDiv);

    const doc = new Document({
      sections: [{
        properties: {},
        children: docElements.length ? docElements : [
          new Paragraph({ children: [new TextRun("Văn bản tài liệu THPT Phù Cừ")] })
        ]
      }]
    });

    return await Packer.toBlob(doc);
  };

  // 2. EXPORT WORD (.docx)
  const handleExportWord = async () => {
    try {
      const blob = await compileHtmlToDocxBlob();
      const exportName = `${fileName || 'Van_Ban'}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportName;
      a.click();
      URL.revokeObjectURL(url);
      setToastMessage(`Đã xuất tệp Word: ${exportName}`);
    } catch (err) {
      alert("Lỗi khi xuất Word: " + err.message);
    }
  };

  // 3. PRIMARY ACTION: SAVE CHANGES
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Compile into native docx blob
      const blob = await compileHtmlToDocxBlob();
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result;
          const base64 = typeof res === 'string' ? res.split(',')[1] : '';
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const docxBase64 = await base64Promise;

      // Save to backend API
      const res = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: `${fileName}.docx`,
          file_type: 'word',
          file_data: docxBase64,
          ma_lop: maLop
        })
      });

      if (res.ok) {
        setIsDirty(false);
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        setLastSavedTime(timeStr);
        setToastMessage(`Đã lưu văn bản Word thành công lúc ${timeStr}!`);
        if (onSaveToBackend) onSaveToBackend({ html: docHtml, fileName });
      } else {
        throw new Error("Máy chủ phản hồi lỗi khi lưu.");
      }
    } catch (err) {
      // Fallback local storage
      try {
        localStorage.setItem(`sotay_word_${maLop}_${fileName}`, editorRef.current?.innerHTML || docHtml);
        setIsDirty(false);
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        setLastSavedTime(timeStr);
        setToastMessage(`Đã lưu văn bản vào bộ nhớ máy lúc ${timeStr}`);
      } catch (localErr) {
        alert("Lỗi lưu văn bản: " + err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. TOP ACTION BAR */}
      <DocumentActionBar
        title={title}
        fileType="word"
        isDirty={isDirty}
        isSaving={isSaving}
        lastSavedTime={lastSavedTime}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onSave={handleSaveChanges}
        onImportFile={handleImportWord}
        onExportFile={handleExportWord}
        acceptTypes=".docx"
        fileName={`${fileName}.docx`}
        toastMessage={toastMessage}
      />

      {/* 2. RICH TEXT FORMATTING TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs shadow-md">
        {/* Paragraph & Headings */}
        <button
          onClick={() => execFormat('formatBlock', '<p>')}
          type="button"
          className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded font-medium transition"
          title="Đoạn văn bản thường"
        >
          Normal
        </button>
        <button
          onClick={() => execFormat('formatBlock', '<h1>')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded font-bold transition flex items-center gap-0.5"
          title="Tiêu đề 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('formatBlock', '<h2>')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded font-bold transition flex items-center gap-0.5"
          title="Tiêu đề 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('formatBlock', '<h3>')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded font-bold transition flex items-center gap-0.5"
          title="Tiêu đề 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-800" />

        {/* Text Styles */}
        <button
          onClick={() => execFormat('bold')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition font-bold"
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('italic')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition italic"
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('underline')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition underline"
          title="Gạch chân (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('strikeThrough')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Gạch ngang chữ"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-800" />

        {/* Alignments */}
        <button
          onClick={() => execFormat('justifyLeft')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Căn lề trái"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('justifyCenter')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Căn giữa"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('justifyRight')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Căn lề phải"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('justifyFull')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Căn đều 2 bên"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-800" />

        {/* Lists */}
        <button
          onClick={() => execFormat('insertUnorderedList')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Danh sách gạch đầu dòng"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => execFormat('insertOrderedList')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Danh sách đánh số"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-800" />

        {/* Table Insert & Controls */}
        <div className="relative">
          <button
            onClick={() => setShowTableModal(!showTableModal)}
            type="button"
            className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded flex items-center gap-1 transition"
            title="Chèn bảng mới"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Chèn bảng</span>
          </button>

          {showTableModal && (
            <div className="absolute top-full left-0 mt-2 z-30 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl space-y-2 w-48 text-xs">
              <div className="font-bold text-white mb-1">Cấu hình bảng</div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Số hàng:</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableConfig.rows}
                  onChange={(e) => setTableConfig({ ...tableConfig, rows: parseInt(e.target.value) || 1 })}
                  className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Số cột:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableConfig.cols}
                  onChange={(e) => setTableConfig({ ...tableConfig, cols: parseInt(e.target.value) || 1 })}
                  className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white"
                />
              </div>
              <button
                onClick={() => handleInsertTable(tableConfig.rows, tableConfig.cols)}
                type="button"
                className="w-full py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded mt-1"
              >
                Chèn ngay
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleAddTableRow}
          type="button"
          className="p-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition flex items-center gap-0.5 text-[11px]"
          title="Thêm hàng vào bảng hiện tại"
        >
          <Plus className="w-3 h-3" /> Hàng
        </button>
        <button
          onClick={handleDeleteTableRow}
          type="button"
          className="p-1 hover:bg-slate-800 text-slate-300 hover:text-red-400 rounded transition flex items-center gap-0.5 text-[11px]"
          title="Xóa hàng trong bảng hiện tại"
        >
          <Trash2 className="w-3 h-3" /> Hàng
        </button>

        <span className="w-px h-4 bg-slate-800" />

        {/* Undo / Redo */}
        <button
          onClick={() => execFormat('undo')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => execFormat('redo')}
          type="button"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. A4 REALISTIC WORD DOCUMENT CANVAS */}
      <div className="bg-slate-950 p-4 md:p-8 rounded-2xl border border-slate-800 overflow-x-auto flex justify-center shadow-inner">
        <div 
          className="w-full max-w-[800px] min-h-[700px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 md:p-12 border border-slate-300 focus:outline-none leading-relaxed transition font-serif selection:bg-cyan-200"
          style={{ minHeight: '842px' }}
        >
          <div
            ref={editorRef}
            contentEditable={isEditing}
            onInput={handleEditorInput}
            suppressContentEditableWarning={true}
            className="w-full h-full min-h-[750px] outline-none prose prose-slate max-w-none text-[14px]"
          />
        </div>
      </div>
    </div>
  );
}
