import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: '91.99.159.222',
  port: 3306,
  user: 'u35324_rAvKni08wl',
  password: 'CS5gKfQ!Oci7bsIExdye+H9!',
  database: 's35324_phc_bot_story_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/phuhuynh/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_phuhuynh WHERE id = ?', [req.params.id]);
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/canbo/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_canbo WHERE id = ?', [req.params.id]);
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
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tkb', async (req, res) => {
  const { tiet, buoi, thu_2, thu_3, thu_4, thu_5, thu_6, thu_7 } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tbl_thoikhoabieu (tiet, buoi, thu_2, thu_3, thu_4, thu_5, thu_6, thu_7) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tiet, buoi, thu_2 || '', thu_3 || '', thu_4 || '', thu_5 || '', thu_6 || '', thu_7 || '']
    );
    res.json({ id: result.insertId, ...req.body });
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tkb/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_thoikhoabieu WHERE id = ?', [req.params.id]);
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/to-hocsinh/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_to_hocsinh WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log('MySQL Backend API listening on http://localhost:5000');
});