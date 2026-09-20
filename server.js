import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// ==========================================
// MULTI-TENANT ARCHITECTURE TABLES (classes, class_module_documents, students)
// ==========================================
const initMultiTenantTables = async () => {
  try {
    // 1. Bảng Classes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        class_name VARCHAR(100) NOT NULL,
        academic_year VARCHAR(20) DEFAULT '2025-2026',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed các lớp học tiêu chuẩn
    const defaultClasses = [
      '10A1', '10A2', '10A3', '10A4', '10D1', '10D2', '10D4',
      '11A1', '11A2', '11D1', '11D2',
      '12A1', '12A2', '12D1', '12D2', '12A7', '12A8'
    ];
    for (const cid of defaultClasses) {
      await pool.query(
        'INSERT IGNORE INTO classes (id, class_name) VALUES (?, ?)',
        [cid, `Lớp ${cid}`]
      );
    }

    // 2. Bảng class_module_documents
    await pool.query(`
      CREATE TABLE IF NOT EXISTS class_module_documents (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL,
        module_key VARCHAR(100) NOT NULL,
        doc_type ENUM('EXCEL', 'WORD') NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        content_json LONGTEXT NULL,
        file_blob_base64 LONGTEXT NULL,
        version INT DEFAULT 1,
        updated_by VARCHAR(100) NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_class_module (class_id, module_key),
        CONSTRAINT fk_module_class FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Bảng students
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL,
        stt INT NULL,
        full_name VARCHAR(150) NOT NULL,
        dob VARCHAR(50) NULL,
        gender ENUM('Nam', 'Nữ', 'Khác') DEFAULT 'Nam',
        parent_name VARCHAR(150) NULL,
        parent_phone VARCHAR(30) NULL,
        address VARCHAR(255) NULL,
        team_group VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_student_class FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Multi-tenant persistence tables verified.');
  } catch (err) {
    console.error('Khởi tạo Multi-tenant persistence thất bại:', err.message);
  }
};
initMultiTenantTables();

// Helper đảm bảo class_id luôn tồn tại trong bảng classes trước khi liên kết
const ensureClassExists = async (classId, className = null) => {
  if (!classId) return;
  try {
    await pool.query(
      'INSERT IGNORE INTO classes (id, class_name) VALUES (?, ?)',
      [classId, className || `Lớp ${classId}`]
    );
  } catch (err) {
    console.warn(`ensureClassExists warning (${classId}):`, err.message);
  }
};

// Migration an toàn: Bổ sung cột document_content LONGTEXT vào 11 bảng hiện có (TUYỆT ĐỐI KHÔNG TẠO BẢNG MỚI)
const runModuleMigrations = async () => {
  const tables = [
    'tbl_phuhuynh',
    'tbl_canbo',
    'tbl_to_hocsinh',
    'tbl_thoikhoabieu',
    'tbl_theodoi',
    'tbl_cabiet',
    'tbl_sinhhoat',
    'tbl_danhgia_tt22',
    'tbl_thidua',
    'tbl_bangiao',
    'tbl_kiemtra_bgh'
  ];
  for (const t of tables) {
    try {
      await pool.query(`ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS document_content LONGTEXT`);
    } catch (e) {
      console.warn(`Migration note on ${t}:`, e.message);
    }
  }
};
runModuleMigrations();

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

app.post('/api/soyeulylich/sync', async (req, res) => {
  const { students, ma_lop } = req.body;
  const lop = ma_lop || '10A1';
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Danh sách học sinh không hợp lệ' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Xóa danh sách cũ của lớp này để cập nhật toàn diện danh sách mới từ bảng tính
    await connection.query('DELETE FROM tbl_soyeulylich WHERE ma_lop = ?', [lop]);
    
    if (students.length > 0) {
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
        lop
      ]);
      await connection.query(
        'INSERT INTO tbl_soyeulylich (ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to, ma_lop) VALUES ?',
        [values]
      );
    }
    await connection.commit();
    await logActivity('SOYEULYLICH_SYNC', `Đồng bộ ${students.length} học sinh từ bảng tính Excel cho lớp ${lop}`);
    res.json({ success: true, count: students.length });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
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

// ==========================================
// 13. LƯU TRỮ VĂN BẢN WORD TỪNG PHÂN HỆ (MODULES DOCUMENT PERSISTENCE)
// ==========================================
app.get('/api/modules/document', async (req, res) => {
  const { moduleId, ma_lop } = req.query;
  const lop = ma_lop || '10A1';
  if (!moduleId) return res.status(400).json({ error: 'Thiếu moduleId' });

  try {
    // 1. Kiểm tra trong tbl_saved_documents (lưu trữ docx/html theo key module_{moduleId}_{lop})
    const docKey = `Module_${moduleId}_${lop}`;
    const [saved] = await pool.query(
      'SELECT file_data, updated_at FROM tbl_saved_documents WHERE file_name = ? AND ma_lop = ? ORDER BY id DESC LIMIT 1',
      [docKey, lop]
    );
    if (saved.length > 0 && saved[0].file_data) {
      return res.json({ content: saved[0].file_data, updated_at: saved[0].updated_at, source: 'saved_documents' });
    }

    // 2. Kiểm tra trong bảng tương ứng của module nếu có column document_content
    const tableMap = {
      phuhuynh: 'tbl_phuhuynh',
      canbo: 'tbl_canbo',
      sodo: 'tbl_to_hocsinh',
      tkb: 'tbl_thoikhoabieu',
      theodoi: 'tbl_theodoi',
      cabiet: 'tbl_cabiet',
      sinhhoat: 'tbl_sinhhoat',
      tt22: 'tbl_danhgia_tt22',
      thidua: 'tbl_thidua',
      bangiao: 'tbl_bangiao',
      bgh: 'tbl_kiemtra_bgh'
    };
    const targetTable = tableMap[moduleId];
    if (targetTable) {
      try {
        const [rows] = await pool.query(
          `SELECT document_content, created_at FROM ${targetTable} WHERE ma_lop = ? AND document_content IS NOT NULL AND document_content != '' ORDER BY id DESC LIMIT 1`,
          [lop]
        );
        if (rows.length > 0 && rows[0].document_content) {
          return res.json({ content: rows[0].document_content, updated_at: rows[0].created_at, source: targetTable });
        }
      } catch (e) {
        // Table query fallback
      }
    }

    res.json({ content: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/modules/document', async (req, res) => {
  const { moduleId, ma_lop, document_content, docx_base64 } = req.body;
  const lop = ma_lop || '10A1';
  if (!moduleId || !document_content) {
    return res.status(400).json({ error: 'Thiếu moduleId hoặc document_content' });
  }

  try {
    const docKey = `Module_${moduleId}_${lop}`;
    // 1. Lưu nội dung HTML / văn bản vào tbl_saved_documents
    const [existing] = await pool.query(
      'SELECT id FROM tbl_saved_documents WHERE file_name = ? AND ma_lop = ?',
      [docKey, lop]
    );
    if (existing.length > 0) {
      await pool.query(
        'UPDATE tbl_saved_documents SET file_data = ?, updated_at = NOW() WHERE id = ?',
        [document_content, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO tbl_saved_documents (file_name, file_type, file_data, ma_lop, updated_at) VALUES (?, ?, ?, ?, NOW())',
        [docKey, 'word_module', document_content, lop]
      );
    }

    // 2. Cập nhật document_content vào bảng tương ứng của module
    const tableMap = {
      phuhuynh: 'tbl_phuhuynh',
      canbo: 'tbl_canbo',
      sodo: 'tbl_to_hocsinh',
      tkb: 'tbl_thoikhoabieu',
      theodoi: 'tbl_theodoi',
      cabiet: 'tbl_cabiet',
      sinhhoat: 'tbl_sinhhoat',
      tt22: 'tbl_danhgia_tt22',
      thidua: 'tbl_thidua',
      bangiao: 'tbl_bangiao',
      bgh: 'tbl_kiemtra_bgh'
    };
    const targetTable = tableMap[moduleId];
    if (targetTable) {
      try {
        await pool.query(
          `UPDATE ${targetTable} SET document_content = ? WHERE ma_lop = ?`,
          [document_content, lop]
        );
      } catch (e) {
        console.warn(`Lưu document_content vào ${targetTable}:`, e.message);
      }
    }

    await logActivity('MODULE_DOC_SAVE', `Lưu văn bản Word phân hệ [${moduleId.toUpperCase()}] cho lớp ${lop}`);
    res.json({ success: true, updated_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 14. ARCHITECTURAL MULTI-TENANT LOAD & SAVE APIS (FIX DATA LOSS ON F5)
// =========================================================================

// GET /api/modules/load?class_id=12A7&module_key=so_yeu_ly_lich
app.get('/api/modules/load', async (req, res) => {
  const { class_id, module_key } = req.query;
  const classId = class_id || '10A1';
  if (!module_key) {
    return res.status(400).json({ error: 'Thiếu module_key' });
  }

  try {
    await ensureClassExists(classId);

    // 1. Kiểm tra trong class_module_documents theo (class_id, module_key)
    const [rows] = await pool.query(
      `SELECT class_id, module_key, doc_type, file_name, content_json, file_blob_base64, version, updated_at 
       FROM class_module_documents 
       WHERE class_id = ? AND module_key = ? 
       LIMIT 1`,
      [classId, module_key]
    );

    if (rows.length > 0 && rows[0].content_json) {
      return res.json({
        success: true,
        exists: true,
        class_id: rows[0].class_id,
        module_key: rows[0].module_key,
        doc_type: rows[0].doc_type,
        file_name: rows[0].file_name,
        content_json: rows[0].content_json,
        file_blob_base64: rows[0].file_blob_base64,
        version: rows[0].version,
        updated_at: rows[0].updated_at
      });
    }

    // 2. Nếu là phân hệ 'so_yeu_ly_lich' chưa có dữ liệu lưu trong class_module_documents:
    if (module_key === 'so_yeu_ly_lich') {
      // 2.1 Kiểm tra bảng students chuẩn hóa trước
      const [studentsData] = await pool.query(
        'SELECT stt, full_name, dob, gender, parent_name, parent_phone, address, team_group FROM students WHERE class_id = ? ORDER BY stt ASC, id ASC',
        [classId]
      );

      if (studentsData.length > 0) {
        const headers = ['STT', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Họ tên Cha/Mẹ', 'Số điện thoại', 'Địa chỉ', 'Tổ số', 'Chức vụ trong tổ'];
        const gridRows = studentsData.map((s, idx) => [
          s.stt || (idx + 1),
          s.full_name || '',
          s.dob || '',
          s.gender || 'Nam',
          s.parent_name || '',
          s.parent_phone || '',
          s.address || '',
          s.team_group ? String(s.team_group).replace(/\D/g, '') || 1 : 1,
          'Thành viên'
        ]);
        const initialPayload = { "Sheet1": [headers, ...gridRows] };
        return res.json({
          success: true,
          exists: true,
          class_id: classId,
          module_key,
          doc_type: 'EXCEL',
          file_name: `So_Yeu_Ly_Lich_${classId}.xlsx`,
          content_json: JSON.stringify(initialPayload),
          version: 1
        });
      }

      // 2.2 Fallback bảng tbl_soyeulylich
      const [legacyData] = await pool.query(
        'SELECT ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, to_so, chuc_vu_to FROM tbl_soyeulylich WHERE ma_lop = ? ORDER BY id ASC',
        [classId]
      );

      if (legacyData.length > 0) {
        const headers = ['STT', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Họ tên Cha/Mẹ', 'Số điện thoại', 'Địa chỉ', 'Tổ số', 'Chức vụ trong tổ'];
        const gridRows = legacyData.map((s, idx) => [
          idx + 1,
          s.ho_ten || '',
          s.ngay_sinh || '',
          s.gioi_tinh || 'Nam',
          s.ho_ten_ph || '',
          s.so_dien_thoai || '',
          s.dia_chi || '',
          s.to_so || 1,
          s.chuc_vu_to || 'Thành viên'
        ]);
        const initialPayload = { "Sheet1": [headers, ...gridRows] };
        return res.json({
          success: true,
          exists: true,
          class_id: classId,
          module_key,
          doc_type: 'EXCEL',
          file_name: `So_Yeu_Ly_Lich_${classId}.xlsx`,
          content_json: JSON.stringify(initialPayload),
          version: 1
        });
      }
    }

    // 3. Fallback đối với tài liệu Word từ tbl_saved_documents nếu có dữ liệu cũ
    const fallbackKey = `Module_${module_key}_${classId}`;
    const [savedLegacy] = await pool.query(
      'SELECT file_data, updated_at FROM tbl_saved_documents WHERE file_name = ? AND ma_lop = ? ORDER BY id DESC LIMIT 1',
      [fallbackKey, classId]
    );
    if (savedLegacy.length > 0 && savedLegacy[0].file_data) {
      return res.json({
        success: true,
        exists: true,
        class_id: classId,
        module_key,
        doc_type: 'WORD',
        file_name: `${module_key}_${classId}.docx`,
        content_json: savedLegacy[0].file_data,
        version: 1,
        updated_at: savedLegacy[0].updated_at
      });
    }

    // 4. Mặc định chưa có dữ liệu lưu trữ
    return res.json({
      success: true,
      exists: false,
      class_id: classId,
      module_key,
      content_json: null
    });
  } catch (err) {
    console.error('Lỗi GET /api/modules/load:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/modules/save
app.post('/api/modules/save', async (req, res) => {
  const {
    class_id,
    module_key,
    doc_type = 'WORD',
    file_name,
    content_json,
    file_blob_base64
  } = req.body;

  const classId = class_id || '10A1';
  if (!module_key || content_json === undefined || content_json === null) {
    return res.status(400).json({ error: 'Thiếu module_key hoặc content_json' });
  }

  const defaultFileName = file_name || `${module_key}_${classId}.${doc_type === 'EXCEL' ? 'xlsx' : 'docx'}`;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Đảm bảo lớp học tồn tại trong classes
    await connection.query(
      'INSERT IGNORE INTO classes (id, class_name) VALUES (?, ?)',
      [classId, `Lớp ${classId}`]
    );

    // 2. UPSERT vào class_module_documents (composite unique index uk_class_module)
    await connection.query(
      `INSERT INTO class_module_documents (class_id, module_key, doc_type, file_name, content_json, file_blob_base64, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         file_name = VALUES(file_name),
         content_json = VALUES(content_json),
         file_blob_base64 = VALUES(file_blob_base64),
         version = version + 1,
         updated_at = NOW()`,
      [classId, module_key, doc_type, defaultFileName, content_json, file_blob_base64 || null]
    );

    // 3. Nếu là so_yeu_ly_lich: đồng bộ tự động vào bảng students & tbl_soyeulylich
    if (module_key === 'so_yeu_ly_lich') {
      let parsedRows = [];
      try {
        const parsed = typeof content_json === 'string' ? JSON.parse(content_json) : content_json;
        if (Array.isArray(parsed)) {
          parsedRows = parsed;
        } else if (parsed && parsed.sheets) {
          const firstSheet = Object.keys(parsed.sheets)[0];
          parsedRows = parsed.sheets[firstSheet] || [];
        } else if (parsed && typeof parsed === 'object') {
          const firstSheet = Object.keys(parsed)[0];
          parsedRows = parsed[firstSheet] || [];
        }
      } catch (e) {
        console.warn('Không thể parse content_json dạng JSON:', e.message);
      }

      if (Array.isArray(parsedRows) && parsedRows.length > 1) {
        // Bỏ qua hàng 0 (tiêu đề cột)
        const dataRows = parsedRows.slice(1).filter(r => 
          Array.isArray(r) && r.some(c => c !== null && c !== undefined && String(c).trim() !== '')
        );

        const studentValues = dataRows.map((r, i) => {
          const stt = Number(r[0]) || (i + 1);
          const fullName = String(r[1] || '').trim();
          const dob = String(r[2] || '').trim();
          const rawGender = String(r[3] || 'Nam').trim();
          const gender = ['Nam', 'Nữ', 'Khác'].includes(rawGender) ? rawGender : 'Nam';
          const parentName = String(r[4] || '').trim();
          const parentPhone = String(r[5] || '').trim();
          const address = String(r[6] || '').trim();
          const teamGroup = r[7] ? `Tổ ${String(r[7]).replace(/\D/g, '') || 1}` : 'Tổ 1';
          const chucVu = String(r[8] || 'Thành viên').trim();
          return { stt, fullName, dob, gender, parentName, parentPhone, address, teamGroup, chucVu };
        }).filter(s => s.fullName && !s.fullName.toLowerCase().includes('họ và tên'));

        // Làm sạch và đồng bộ lại danh sách lớp trong bảng students
        await connection.query('DELETE FROM students WHERE class_id = ?', [classId]);

        if (studentValues.length > 0) {
          const insertStudents = studentValues.map(s => [
            classId,
            s.stt,
            s.fullName,
            s.dob,
            s.gender,
            s.parentName,
            s.parentPhone,
            s.address,
            s.teamGroup
          ]);
          await connection.query(
            'INSERT INTO students (class_id, stt, full_name, dob, gender, parent_name, parent_phone, address, team_group) VALUES ?',
            [insertStudents]
          );

          // Cập nhật tbl_soyeulylich song song để dashboard sĩ số đồng bộ
          await connection.query('DELETE FROM tbl_soyeulylich WHERE ma_lop = ?', [classId]);
          const insertLegacy = studentValues.map(s => [
            s.fullName,
            s.dob,
            s.gender,
            s.parentName,
            s.parentPhone,
            s.address,
            '',
            Number(s.teamGroup.replace(/\D/g, '')) || 1,
            s.chucVu,
            classId
          ]);
          await connection.query(
            'INSERT INTO tbl_soyeulylich (ho_ten, ngay_sinh, gioi_tinh, ho_ten_ph, so_dien_thoai, dia_chi, ghi_chu, to_so, chuc_vu_to, ma_lop) VALUES ?',
            [insertLegacy]
          );
        }
      }
    }

    await connection.commit();
    await logActivity('MODULE_DOC_SAVE', `Lưu thành công phân hệ [${module_key}] cho lớp ${classId}`);
    res.json({
      success: true,
      message: `Đã lưu thay đổi cho lớp [${classId}] thành công!`,
      class_id: classId,
      module_key,
      version: 1,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    await connection.rollback();
    console.error('Lỗi POST /api/modules/save:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
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