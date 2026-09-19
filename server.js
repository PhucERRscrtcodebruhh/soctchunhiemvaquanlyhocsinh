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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_soyeulylich ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/soyeulylich', async (req, res) => {
  const { ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_soyeulylich (ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ho_ten, ngay_sinh || '', gioi_tinh || 'Nam', ho_ten_ph || '', so_dien_thoai || '', dia_chi || '', ghi_chu || '', Number(to_so) || 1, chuc_vu_to || 'Thành viên']
    );
    await logActivity('SOYEULYLICH_ADD', `Thêm hồ sơ học sinh: ${ho_ten}`);
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/soyeulylich/batch', async (req, res) => {
  const { students } = req.body;
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
      s.chuc_vu_to || 'Thành viên'
    ]);
    await pool.query(
      'INSERT INTO tbl_soyeulylich (ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to) VALUES ?',
      [values]
    );
    await logActivity('SOYEULYLICH_BATCH', `Nhập ${students.length} học sinh từ file Excel`);
    res.json({ success: true, count: students.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/soyeulylich/:id', async (req, res) => {
  const { ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_soyeulylich SET ho_ten=?, ngay_sinh=?, gioi_tinh=?, ho_ten_ph=?, so_dien_thoai=?, dia_chi=?, ghi_chu=?, to_so=?, chuc_vu_to=? WHERE id=?',
      [ho_ten, ngay_sinh || '', gioi_tinh || 'Nam', ho_ten_ph || '', so_dien_thoai || '', dia_chi || '', ghi_chu || '', Number(to_so) || 1, chuc_vu_to || 'Thành viên', req.params.id]
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
  try {
    await pool.query('TRUNCATE TABLE tbl_soyeulylich');
    await logActivity('SOYEULYLICH_CLEAR', 'Xóa toàn bộ danh sách sơ yếu lý lịch học sinh');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. BAN ĐẠI DIỆN PHHS (CRUD)
// ==========================================
app.get('/api/phuhuynh', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_phuhuynh ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/phuhuynh', async (req, res) => {
  const { ho_ten_ph, phu_huynh_em, chuc_vu, so_dien_thoai, dia_chi } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_phuhuynh (ho_ten_ph, phu_huynh_em, chuc_vu, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?)',
      [ho_ten_ph, phu_huynh_em || '', chuc_vu || 'Thành viên', so_dien_thoai || '', dia_chi || '']
    );
    await logActivity('PHUHUYNH_CREATE', `Thêm phụ huynh: ${ho_ten_ph} (Phụ huynh em ${phu_huynh_em})`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_canbo ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/canbo', async (req, res) => {
  const { chuc_vu, ho_ten, nhiem_vu, so_dien_thoai, loai_can_bo } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_canbo (chuc_vu, ho_ten, nhiem_vu, so_dien_thoai, loai_can_bo) VALUES (?, ?, ?, ?, ?)',
      [chuc_vu, ho_ten, nhiem_vu || '', so_dien_thoai || '', loai_can_bo || 'LOP']
    );
    await logActivity('CANBO_CREATE', `Phân công cán bộ: ${ho_ten} - Chức vụ: ${chuc_vu}`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_thoikhoabieu ORDER BY buoi ASC, tiet ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tkb/init', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM tbl_thoikhoabieu');
    if (rows[0].cnt === 0) {
      for (let i = 1; i <= 5; i++) {
        await pool.query('INSERT INTO tbl_thoikhoabieu (tiet, buoi) VALUES (?, "SANG")', [i]);
      }
      for (let i = 1; i <= 3; i++) {
        await pool.query('INSERT INTO tbl_thoikhoabieu (tiet, buoi) VALUES (?, "CHIEU")', [i]);
      }
      await logActivity('TKB_INIT', 'Khởi tạo cấu trúc khung thời khóa biểu 8 tiết');
    }
    res.json({ success: true });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_to_hocsinh ORDER BY to_so ASC, id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/to-hocsinh', async (req, res) => {
  const { to_so, ho_ten, chuc_vu_to, ghi_chu } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_to_hocsinh (to_so, ho_ten, chuc_vu_to, ghi_chu) VALUES (?, ?, ?, ?)',
      [to_so, ho_ten, chuc_vu_to || 'Thành viên', ghi_chu || '']
    );
    await logActivity('HOCSINH_ADD', `Thêm học sinh ${ho_ten} vào Tổ ${to_so}`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_theodoi ORDER BY ngay_thang DESC, id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/theodoi', async (req, res) => {
  const { ngay_thang, ho_ten, mon_hoc, diem_nhan_xet, vi_pham_khen_thuong } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_theodoi (ngay_thang, ho_ten, mon_hoc, diem_nhan_xet, vi_pham_khen_thuong) VALUES (?, ?, ?, ?, ?)',
      [ngay_thang || new Date().toISOString().slice(0, 10), ho_ten, mon_hoc || '', diem_nhan_xet || '', vi_pham_khen_thuong || '']
    );
    await logActivity('THEODOI_ADD', `Ghi nhận học tập học sinh: ${ho_ten} - Môn: ${mon_hoc || 'N/A'}`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_cabiet ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cabiet', async (req, res) => {
  const { ho_ten, bieu_hien, bien_phap, xac_nhan_ph } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_cabiet (ho_ten, bieu_hien, bien_phap, xac_nhan_ph) VALUES (?, ?, ?, ?)',
      [ho_ten, bieu_hien || '', bien_phap || '', xac_nhan_ph || 'Chưa ký']
    );
    await logActivity('CABIET_ADD', `Lập hồ sơ hỗ trợ giáo dục cá biệt: ${ho_ten}`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_sinhhoat ORDER BY tuan DESC, id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sinhhoat', async (req, res) => {
  const { tuan, ngay_hop, danh_gia, phuong_huong, tuyen_duong } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_sinhhoat (tuan, ngay_hop, danh_gia, phuong_huong, tuyen_duong) VALUES (?, ?, ?, ?, ?)',
      [tuan || 1, ngay_hop || new Date().toISOString().slice(0, 10), danh_gia || '', phuong_huong || '', tuyen_duong || '']
    );
    await logActivity('SINHHOAT_ADD', `Lưu biên bản sinh hoạt lớp Tuần ${tuan}`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_danhgia_tt22 ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tt22', async (req, res) => {
  const { ho_ten, hk1_ht, hk1_rl, cn_ht, danh_hieu } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_danhgia_tt22 (ho_ten, hk1_ht, hk1_rl, cn_ht, danh_hieu) VALUES (?, ?, ?, ?, ?)',
      [ho_ten, hk1_ht || 'Đạt', hk1_rl || 'Tốt', cn_ht || 'Đạt', danh_hieu || 'Học sinh tiên tiến']
    );
    await logActivity('TT22_ADD', `Xếp loại Thông tư 22 cho HS: ${ho_ten}`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_thidua ORDER BY tuan ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/thidua', async (req, res) => {
  const { tuan, diem_so, hang_khoi, hang_truong, co_thi_dua } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_thidua (tuan, diem_so, hang_khoi, hang_truong, co_thi_dua) VALUES (?, ?, ?, ?, ?)',
      [tuan || 1, diem_so || 100, hang_khoi || 1, hang_truong || 1, co_thi_dua || 'Cờ Nhất']
    );
    await logActivity('THIDUA_ADD', `Ghi nhận thi đua Tuần ${tuan} - Điểm: ${diem_so}`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_bangiao ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bangiao', async (req, res) => {
  const { dot_ban_giao, ngay_ban_giao, si_so, tinh_trang, dai_dien_dia_phuong } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_bangiao (dot_ban_giao, ngay_ban_giao, si_so, tinh_trang, dai_dien_dia_phuong) VALUES (?, ?, ?, ?, ?)',
      [dot_ban_giao, ngay_ban_giao || new Date().toISOString().slice(0, 10), si_so || 0, tinh_trang || '', dai_dien_dia_phuong || '']
    );
    await logActivity('BANGIAO_ADD', `Lập biên bản bàn giao: ${dot_ban_giao}`);
    res.json({ id: result.insertId, ...req.body });
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
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_kiemtra_bgh ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bgh', async (req, res) => {
  const { dot_kiem_tra, ngay_duyet, y_kien_bgh, xep_loai } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_kiemtra_bgh (dot_kiem_tra, ngay_duyet, y_kien_bgh, xep_loai) VALUES (?, ?, ?, ?)',
      [dot_kiem_tra, ngay_duyet || new Date().toISOString().slice(0, 10), y_kien_bgh || '', xep_loai || 'Tốt']
    );
    await logActivity('BGH_DUYET', `BGH nhận xét ${dot_kiem_tra}: Xếp loại ${xep_loai}`);
    res.json({ id: result.insertId, ...req.body });
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

// Chỉ lắng nghe port nếu chạy local node server.js
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`MySQL Backend API listening on http://localhost:${PORT}`);
  });
}

export default app;