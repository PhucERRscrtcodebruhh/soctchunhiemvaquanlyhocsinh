export function LyLichHocSinh({ classData }) {
  const [columns, setColumns] = React.useState([]); // Danh sách tên cột động từ file
  const [rows, setRows] = React.useState([]);       // Dữ liệu từng hàng
  const [fileName, setFileName] = React.useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });

      // Lấy sheet đầu tiên trong file
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Chuyển sheet thành mảng 2 chiều (header: 1 lấy toàn bộ raw rows)
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data && data.length > 0) {
        // Hàng đầu tiên làm tiêu đề cột
        const headers = data[0].filter(h => h !== undefined && h !== null && h !== '');
        const contentRows = data.slice(1).filter(r => r.some(cell => cell !== undefined && cell !== null && cell !== ''));

        setColumns(headers);
        setRows(contentRows);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleClear = () => {
    setColumns([]);
    setRows([]);
    setFileName('');
  };

  return (
    <ModuleContainer 
      title="SƠ YẾU LÝ LỊCH HỌC SINH" 
      desc="Tải lên tệp Excel danh sách học sinh. Bảng sẽ tự động co giãn theo toàn bộ số cột và số hàng của tệp."
    >
      {/* Thanh công cụ Import */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-500/10">
            <Upload className="w-4 h-4" />
            <span>Tải lên file Excel (.xlsx, .xls)</span>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
          {fileName && (
            <span className="text-xs text-cyan-400 font-mono">
              Đang xem: <b>{fileName}</b> ({rows.length} học sinh)
            </span>
          )}
        </div>

        {columns.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-1.5 border border-red-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa bảng</span>
          </button>
        )}
      </div>

      {/* Hiển thị bảng động theo cột/hàng của file */}
      {columns.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Chưa có dữ liệu danh sách học sinh</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Thầy/Cô hãy tải lên file Excel chứa danh sách lớp. Bảng sẽ tự động nhận diện tất cả các cột thông tin mà không cần định dạng sẵn.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-800/90 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 backdrop-blur">
              <tr>
                <th className="p-3 border-b border-slate-700 w-12 text-center">STT</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3 border-b border-slate-700 font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-center font-mono text-slate-500">{rIdx + 1}</td>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="p-3">
                      {row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModuleContainer>
  );
}