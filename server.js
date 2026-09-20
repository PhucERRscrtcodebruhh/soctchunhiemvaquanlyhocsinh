import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || '91.99.159.222',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'u35324_rAvKni08wl',
  password: process.env.DB_PASSWORD || 'CS5gKfQ!Oci7bsIExdye+H9!',
  database: process.env.DB_NAME || 's35324_phc_bot_story_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tự động khởi tạo bảng Logs
const initLogsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        details TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.error('Khởi tạo tbl_system_logs thất bại:', err.message);
  }
};
initLogsTable();

// Tự động khởi tạo bảng Tài liệu & Tệp tin lưu trữ (Word / Excel)
const initDocumentsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_saved_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_data LONGTEXT NOT NULL,
        ma_lop VARCHAR(50) NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.error('Khởi tạo tbl_saved_documents thất bại:', err.message);
  }
};
initDocumentsTable();

// Hàm ghi log vào DB
const logActivity = async (action, details) => {
  try {
    await pool.query(
      'INSERT INTO tbl_system_logs (action, details, timestamp) VALUES (?, ?, NOW())',
      [action, details]
    );
  } catch (e) {
    console.error('Lỗi ghi log:', e.message);
  }
};

// ==========================================
// 0. HEALTH CHECK & LOGS SYSTEM
// ==========================================
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  try {
    await pool.query('SELECT 1');
    const latency = Date.now() - startTime;
    res.json({
      status: 'connected',
      latency,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    const latency = Date.now() - startTime;
    res.status(503).json({
      status: 'disconnected',
      latency,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_system_logs ORDER BY timestamp DESC LIMIT 30');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 0.1. SƠ YẾU LÝ LỊCH HỌC SINH (CRUD & BATCH)
// ==========================================
app.get('/api/soyeulylich', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_soyeulylich WHERE ma_lop = ? ORDER BY to_so ASC, id ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/soyeulylich', async (req, res) => {
  const { ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_soyeulylich (ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to, ma_lop) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ho_ten, ngay_sinh || '', gioi_tinh || 'Nam', ho_ten_ph || '', so_dien_thoai || '', dia_chi || '', ghi_chu || '', Number(to_so) || 1, chuc_vu_to || 'Thành viên', lop]
    );
    await logActivity('SOYEULYLICH_ADD', `Thêm hồ sơ học sinh: ${ho_ten} (${lop})`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/soyeulylich/batch', async (req, res) => {
  const { students, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Danh sách học sinh không hợp lệ' });
  }
  try {
    const values = students.map(s => [
      s.ho_ten || '',
      s.ngay_sinh || '',
      s.gioi_tinh || 'Nam',
      s.ho_ten_ph || '',
      s.so_dien_thoai || '',
      s.dia_chi || '',
      s.ghi_chu || '',
      Number(s.to_so) || 1,
      s.chuc_vu_to || 'Thành viên',
      s.ma_lop || lop
    ]);
    await pool.query(
      'INSERT INTO tbl_soyeulylich (ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to, ma_lop) VALUES ?',
      [values]
    );
    await logActivity('SOYEULYLICH_BATCH', `Nhập ${students.length} học sinh cho lớp ${lop} từ file Excel`);
    res.json({ success: true, count: students.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/soyeulylich/:id', async (req, res) => {
  const { ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to, ma_lop } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_soyeulylich SET ho_ten=?, ngay_sinh=?, gioi_tinh=?, ho_ten_ph=?, so_dien_thoai=?, dia_chi=?, ghi_chu=?, to_so=?, chuc_vu_to=?, ma_lop=COALESCE(?, ma_lop) WHERE id=?',
      [ho_ten, ngay_sinh || '', gioi_tinh || 'Nam', ho_ten_ph || '', so_dien_thoai || '', dia_chi || '', ghi_chu || '', Number(to_so) || 1, chuc_vu_to || 'Thành viên', ma_lop || null, req.params.id]
    );
    await logActivity('SOYEULYLICH_UPDATE', `Cập nhật hồ sơ học sinh ID #${req.params.id}: ${ho_ten}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/soyeulylich/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_soyeulylich WHERE id=?', [req.params.id]);
    await logActivity('SOYEULYLICH_DELETE', `Xóa học sinh ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/soyeulylich', async (req, res) => {
  const ma_lop = req.query.ma_lop || req.body?.ma_lop;
  try {
    if (ma_lop) {
      await pool.query('DELETE FROM tbl_soyeulylich WHERE ma_lop = ?', [ma_lop]);
      await logActivity('SOYEULYLICH_CLEAR', `Xóa toàn bộ danh sách sơ yếu lý lịch lớp ${ma_lop}`);
    } else {
      await pool.query('TRUNCATE TABLE tbl_soyeulylich');
      await logActivity('SOYEULYLICH_CLEAR', 'Xóa toàn bộ danh sách sơ yếu lý lịch toàn trường');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. BAN ĐẠI DIỆN PHHS (CRUD)
// ==========================================
app.get('/api/phuhuynh', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_phuhuynh WHERE ma_lop = ? ORDER BY id ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/phuhuynh', async (req, res) => {
  const { ho_ten_ph, phu_huynh_em, chuc_vu, so_dien_thoai, dia_chi, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_phuhuynh (ho_ten_ph, phu_huynh_em, chuc_vu, so_dien_thoai, dia_chi, ma_lop) VALUES (?, ?, ?, ?, ?, ?)',
      [ho_ten_ph, phu_huynh_em || '', chuc_vu || 'Thành viên', so_dien_thoai || '', dia_chi || '', lop]
    );
    await logActivity('PHUHUYNH_CREATE', `Thêm phụ huynh: ${ho_ten_ph} (${lop})`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/phuhuynh/:id', async (req, res) => {
  const { ho_ten_ph, phu_huynh_em, chuc_vu, so_dien_thoai, dia_chi } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_phuhuynh SET ho_ten_ph = ?, phu_huynh_em = ?, chuc_vu = ?, so_dien_thoai = ?, dia_chi = ? WHERE id = ?',
      [ho_ten_ph, phu_huynh_em, chuc_vu, so_dien_thoai, dia_chi, req.params.id]
    );
    await logActivity('PHUHUYNH_UPDATE', `Cập nhật thông tin phụ huynh ID #${req.params.id}: ${ho_ten_ph}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/phuhuynh/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_phuhuynh WHERE id = ?', [req.params.id]);
    await logActivity('PHUHUYNH_DELETE', `Xóa phụ huynh ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. CÁN BỘ ĐOÀN & CÁN BỘ LỚP (CRUD)
// ==========================================
app.get('/api/canbo', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_canbo WHERE ma_lop = ? ORDER BY id ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/canbo', async (req, res) => {
  const { chuc_vu, ho_ten, nhiem_vu, so_dien_thoai, loai_can_bo, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_canbo (chuc_vu, ho_ten, nhiem_vu, so_dien_thoai, loai_can_bo, ma_lop) VALUES (?, ?, ?, ?, ?, ?)',
      [chuc_vu, ho_ten, nhiem_vu || '', so_dien_thoai || '', loai_can_bo || 'LOP', lop]
    );
    await logActivity('CANBO_CREATE', `Phân công cán bộ: ${ho_ten} (${lop})`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/canbo/:id', async (req, res) => {
  const { chuc_vu, ho_ten, nhiem_vu, so_dien_thoai, loai_can_bo } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_canbo SET chuc_vu = ?, ho_ten = ?, nhiem_vu = ?, so_dien_thoai = ?, loai_can_bo = ? WHERE id = ?',
      [chuc_vu, ho_ten, nhiem_vu, so_dien_thoai, loai_can_bo, req.params.id]
    );
    await logActivity('CANBO_UPDATE', `Cập nhật cán bộ ID #${req.params.id}: ${ho_ten}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/canbo/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_canbo WHERE id = ?', [req.params.id]);
    await logActivity('CANBO_DELETE', `Xóa cán bộ ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. THỜI KHÓA BIỂU (CRUD)
// ==========================================
app.get('/api/tkb', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_thoikhoabieu WHERE ma_lop = ? ORDER BY buoi ASC, tiet ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tkb/init', async (req, res) => {
  const ma_lop = req.body?.ma_lop || req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM tbl_thoikhoabieu WHERE ma_lop = ?', [ma_lop]);
    if (rows[0].cnt === 0) {
      for (let i = 1; i <= 5; i++) {
        await pool.query('INSERT INTO tbl_thoikhoabieu (tiet, buoi, ma_lop) VALUES (?, "SANG", ?)', [i, ma_lop]);
      }
      for (let i = 1; i <= 3; i++) {
        await pool.query('INSERT INTO tbl_thoikhoabieu (tiet, buoi, ma_lop) VALUES (?, "CHIEU", ?)', [i, ma_lop]);
      }
      await logActivity('TKB_INIT', `Khởi tạo cấu trúc khung thời khóa biểu 8 tiết cho lớp ${ma_lop}`);
    }
    res.json({ success: true, ma_lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tkb/:id', async (req, res) => {
  const { thu_2, thu_3, thu_4, thu_5, thu_6, thu_7 } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_thoikhoabieu SET thu_2 = ?, thu_3 = ?, thu_4 = ?, thu_5 = ?, thu_6 = ?, thu_7 = ? WHERE id = ?',
      [thu_2 || '', thu_3 || '', thu_4 || '', thu_5 || '', thu_6 || '', thu_7 || '', req.params.id]
    );
    await logActivity('TKB_UPDATE', `Sửa thời khóa biểu tiết ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CHIA TỔ & HỌC SINH THEO TỔ (CRUD)
// ==========================================
app.get('/api/to-hocsinh', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_to_hocsinh WHERE ma_lop = ? ORDER BY to_so ASC, id ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/to-hocsinh', async (req, res) => {
  const { to_so, ho_ten, chuc_vu_to, ghi_chu, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_to_hocsinh (to_so, ho_ten, chuc_vu_to, ghi_chu, ma_lop) VALUES (?, ?, ?, ?, ?)',
      [to_so, ho_ten, chuc_vu_to || 'Thành viên', ghi_chu || '', lop]
    );
    await logActivity('HOCSINH_ADD', `Thêm học sinh ${ho_ten} vào Tổ ${to_so} (${lop})`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/to-hocsinh/:id', async (req, res) => {
  const { to_so, ho_ten, chuc_vu_to, ghi_chu } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_to_hocsinh SET to_so = ?, ho_ten = ?, chuc_vu_to = ?, ghi_chu = ? WHERE id = ?',
      [to_so, ho_ten, chuc_vu_to, ghi_chu || '', req.params.id]
    );
    await logActivity('HOCSINH_UPDATE', `Cập nhật học sinh ID #${req.params.id}: ${ho_ten}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/to-hocsinh/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_to_hocsinh WHERE id = ?', [req.params.id]);
    await logActivity('HOCSINH_DELETE', `Xóa học sinh ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. THEO DÕI HỌC TẬP & RÈN LUYỆN
// ==========================================
app.get('/api/theodoi', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_theodoi WHERE ma_lop = ? ORDER BY ngay_thang DESC, id DESC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/theodoi', async (req, res) => {
  const { ngay_thang, ho_ten, mon_hoc, diem_nhan_xet, vi_pham_khen_thuong, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_theodoi (ngay_thang, ho_ten, mon_hoc, diem_nhan_xet, vi_pham_khen_thuong, ma_lop) VALUES (?, ?, ?, ?, ?, ?)',
      [ngay_thang || new Date().toISOString().slice(0, 10), ho_ten, mon_hoc || '', diem_nhan_xet || '', vi_pham_khen_thuong || '', lop]
    );
    await logActivity('THEODOI_ADD', `Ghi nhận học tập: ${ho_ten} (${lop}) - Môn: ${mon_hoc || 'N/A'}`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/theodoi/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_theodoi WHERE id=?', [req.params.id]);
    await logActivity('THEODOI_DELETE', `Xóa bản ghi theo dõi ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. GIÁO DỤC HỌC SINH CÁ BIỆT
// ==========================================
app.get('/api/cabiet', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_cabiet WHERE ma_lop = ? ORDER BY id ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cabiet', async (req, res) => {
  const { ho_ten, bieu_hien, bien_phap, xac_nhan_ph, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_cabiet (ho_ten, bieu_hien, bien_phap, xac_nhan_ph, ma_lop) VALUES (?, ?, ?, ?, ?)',
      [ho_ten, bieu_hien || '', bien_phap || '', xac_nhan_ph || 'Chưa ký', lop]
    );
    await logActivity('CABIET_ADD', `Lập hồ sơ hỗ trợ giáo dục cá biệt: ${ho_ten} (${lop})`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cabiet/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_cabiet WHERE id=?', [req.params.id]);
    await logActivity('CABIET_DELETE', `Xóa hồ sơ cá biệt ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. BIÊN BẢN & KẾ HOẠCH SINH HOẠT LỚP
// ==========================================
app.get('/api/sinhhoat', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_sinhhoat WHERE ma_lop = ? ORDER BY tuan DESC, id DESC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sinhhoat', async (req, res) => {
  const { tuan, ngay_hop, danh_gia, phuong_huong, tuyen_duong, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_sinhhoat (tuan, ngay_hop, danh_gia, phuong_huong, tuyen_duong, ma_lop) VALUES (?, ?, ?, ?, ?, ?)',
      [tuan || 1, ngay_hop || new Date().toISOString().slice(0, 10), danh_gia || '', phuong_huong || '', tuyen_duong || '', lop]
    );
    await logActivity('SINHHOAT_ADD', `Lưu biên bản sinh hoạt Tuần ${tuan} (${lop})`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sinhhoat/:id', async (req, res) => {
  const { tuan, ngay_hop, danh_gia, phuong_huong, tuyen_duong } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_sinhhoat SET tuan=?, ngay_hop=?, danh_gia=?, phuong_huong=?, tuyen_duong=? WHERE id=?',
      [tuan, ngay_hop, danh_gia, phuong_huong, tuyen_duong, req.params.id]
    );
    await logActivity('SINHHOAT_UPDATE', `Cập nhật biên bản sinh hoạt lớp ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sinhhoat/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_sinhhoat WHERE id=?', [req.params.id]);
    await logActivity('SINHHOAT_DELETE', `Xóa biên bản sinh hoạt ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. TỔNG HỢP XẾP LOẠI THÔNG TƯ 22
// ==========================================
app.get('/api/tt22', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_danhgia_tt22 WHERE ma_lop = ? ORDER BY id ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tt22', async (req, res) => {
  const { ho_ten, hk1_ht, hk1_rl, cn_ht, danh_hieu, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_danhgia_tt22 (ho_ten, hk1_ht, hk1_rl, cn_ht, danh_hieu, ma_lop) VALUES (?, ?, ?, ?, ?, ?)',
      [ho_ten, hk1_ht || 'Đạt', hk1_rl || 'Tốt', cn_ht || 'Đạt', danh_hieu || 'Học sinh tiên tiến', lop]
    );
    await logActivity('TT22_ADD', `Xếp loại Thông tư 22 cho HS: ${ho_ten} (${lop})`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tt22/:id', async (req, res) => {
  const { ho_ten, hk1_ht, hk1_rl, cn_ht, danh_hieu } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_danhgia_tt22 SET ho_ten=?, hk1_ht=?, hk1_rl=?, cn_ht=?, danh_hieu=? WHERE id=?',
      [ho_ten, hk1_ht, hk1_rl, cn_ht, danh_hieu, req.params.id]
    );
    await logActivity('TT22_UPDATE', `Cập nhật xếp loại TT22 ID #${req.params.id}: ${ho_ten}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tt22/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_danhgia_tt22 WHERE id=?', [req.params.id]);
    await logActivity('TT22_DELETE', `Xóa xếp loại TT22 ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG
// ==========================================
app.get('/api/thidua', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_thidua WHERE ma_lop = ? ORDER BY tuan ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/thidua', async (req, res) => {
  const { tuan, diem_so, hang_khoi, hang_truong, co_thi_dua, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_thidua (tuan, diem_so, hang_khoi, hang_truong, co_thi_dua, ma_lop) VALUES (?, ?, ?, ?, ?, ?)',
      [tuan || 1, diem_so || 100, hang_khoi || 1, hang_truong || 1, co_thi_dua || 'Cờ Nhất', lop]
    );
    await logActivity('THIDUA_ADD', `Ghi nhận thi đua Tuần ${tuan} (${lop}) - Điểm: ${diem_so}`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/thidua/:id', async (req, res) => {
  const { tuan, diem_so, hang_khoi, hang_truong, co_thi_dua } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_thidua SET tuan=?, diem_so=?, hang_khoi=?, hang_truong=?, co_thi_dua=? WHERE id=?',
      [tuan, diem_so, hang_khoi, hang_truong, co_thi_dua, req.params.id]
    );
    await logActivity('THIDUA_UPDATE', `Cập nhật thi đua ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/thidua/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_thidua WHERE id=?', [req.params.id]);
    await logActivity('THIDUA_DELETE', `Xóa thi đua ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. BIÊN BẢN BÀN GIAO NGHỈ TẾT & HÈ
// ==========================================
app.get('/api/bangiao', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_bangiao WHERE ma_lop = ? ORDER BY id DESC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bangiao', async (req, res) => {
  const { dot_ban_giao, ngay_ban_giao, si_so, tinh_trang, dai_dien_dia_phuong, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_bangiao (dot_ban_giao, ngay_ban_giao, si_so, tinh_trang, dai_dien_dia_phuong, ma_lop) VALUES (?, ?, ?, ?, ?, ?)',
      [dot_ban_giao, ngay_ban_giao || new Date().toISOString().slice(0, 10), si_so || 0, tinh_trang || '', dai_dien_dia_phuong || '', lop]
    );
    await logActivity('BANGIAO_ADD', `Lập biên bản bàn giao: ${dot_ban_giao} (${lop})`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bangiao/:id', async (req, res) => {
  const { dot_ban_giao, ngay_ban_giao, si_so, tinh_trang, dai_dien_dia_phuong } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_bangiao SET dot_ban_giao=?, ngay_ban_giao=?, si_so=?, tinh_trang=?, dai_dien_dia_phuong=? WHERE id=?',
      [dot_ban_giao, ngay_ban_giao, si_so, tinh_trang, dai_dien_dia_phuong, req.params.id]
    );
    await logActivity('BANGIAO_UPDATE', `Cập nhật biên bản bàn giao ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bangiao/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_bangiao WHERE id=?', [req.params.id]);
    await logActivity('BANGIAO_DELETE', `Xóa biên bản bàn giao ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. BGH KIỂM TRA & NHẬN XÉT SỔ
// ==========================================
app.get('/api/bgh', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_kiemtra_bgh WHERE ma_lop = ? ORDER BY id ASC', [ma_lop]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bgh', async (req, res) => {
  const { dot_kiem_tra, ngay_duyet, y_kien_bgh, xep_loai, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_kiemtra_bgh (dot_kiem_tra, ngay_duyet, y_kien_bgh, xep_loai, ma_lop) VALUES (?, ?, ?, ?, ?)',
      [dot_kiem_tra, ngay_duyet || new Date().toISOString().slice(0, 10), y_kien_bgh || '', xep_loai || 'Tốt', lop]
    );
    await logActivity('BGH_DUYET', `BGH nhận xét ${dot_kiem_tra} (${lop}): Xếp loại ${xep_loai}`);
    res.json({ id: result.insertId, ...req.body, ma_lop: lop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bgh/:id', async (req, res) => {
  const { dot_kiem_tra, ngay_duyet, y_kien_bgh, xep_loai } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_kiemtra_bgh SET dot_kiem_tra=?, ngay_duyet=?, y_kien_bgh=?, xep_loai=? WHERE id=?',
      [dot_kiem_tra, ngay_duyet, y_kien_bgh, xep_loai, req.params.id]
    );
    await logActivity('BGH_UPDATE', `Cập nhật nhận xét BGH ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bgh/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_kiemtra_bgh WHERE id=?', [req.params.id]);
    await logActivity('BGH_DELETE', `Xóa nhận xét BGH ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. TÀI LIỆU VÀ TỆP TIN LƯU TRỮ (WORD / EXCEL)
// ==========================================
app.get('/api/documents', async (req, res) => {
  const ma_lop = req.query.ma_lop || '10A1';
  try {
    const [rows] = await pool.query(
      'SELECT id, file_name, file_type, ma_lop, updated_at FROM tbl_saved_documents WHERE ma_lop = ? ORDER BY updated_at DESC', 
      [ma_lop]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_saved_documents WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy tệp' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents/save', async (req, res) => {
  const { file_name, file_type, file_data, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  if (!file_name || !file_data) {
    return res.status(400).json({ error: 'Thiếu thông tin tên tệp hoặc dữ liệu' });
  }
  try {
    const [existing] = await pool.query(
      'SELECT id FROM tbl_saved_documents WHERE file_name = ? AND ma_lop = ?', 
      [file_name, lop]
    );
    let docId;
    if (existing.length > 0) {
      docId = existing[0].id;
      await pool.query(
        'UPDATE tbl_saved_documents SET file_data = ?, file_type = ?, updated_at = NOW() WHERE id = ?', 
        [file_data, file_type || 'document', docId]
      );
      await logActivity('DOC_UPDATE', `Cập nhật tệp ${file_type?.toUpperCase() || ''}: ${file_name} (${lop})`);
    } else {
      const [result] = await pool.query(
        'INSERT INTO tbl_saved_documents (file_name, file_type, file_data, ma_lop, updated_at) VALUES (?, ?, ?, ?, NOW())',
        [file_name, file_type || 'document', file_data, lop]
      );
      docId = result.insertId;
      await logActivity('DOC_SAVE', `Lưu tệp mới ${file_type?.toUpperCase() || ''}: ${file_name} (${lop})`);
    }
    res.json({ success: true, id: docId, file_name, updated_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_saved_documents WHERE id = ?', [req.params.id]);
    await logActivity('DOC_DELETE', `Xóa tệp lưu trữ ID #${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chỉ lắng nghe port nếu chạy local node server.js
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`MySQL Backend API listening on http://localhost:${PORT}`);
  });
}

export default app;