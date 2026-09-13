import mammoth from 'mammoth';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType } from 'docx';

export async function parseDocxLines(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

export async function exportDocxTable({ title, headers, rows, filename }) {
  const tableRows = [
    new TableRow({
      children: headers.map(h => new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: h, bold: true, color: "FFFFFF" })],
            alignment: AlignmentType.CENTER
          })
        ],
        shading: { fill: "0F172A" }
      }))
    }),
    ...rows.map(row => new TableRow({
      children: row.map(cell => new TableCell({
        children: [new Paragraph({ text: String(cell !== undefined && cell !== null ? cell : '') })]
      }))
    }))
  ];

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 28, color: "06B6D4" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}