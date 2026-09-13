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
// ==========================================
// 1. THEO DÕI HỌC TẬP & RÈN LUYỆN
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
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/theodoi/:id', async (req, res) => {
  const { ngay_thang, ho_ten, mon_hoc, diem_nhan_xet, vi_pham_khen_thuong } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_theodoi SET ngay_thang=?, ho_ten=?, mon_hoc=?, diem_nhan_xet=?, vi_pham_khen_thuong=? WHERE id=?',
      [ngay_thang, ho_ten, mon_hoc, diem_nhan_xet, vi_pham_khen_thuong, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/theodoi/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_theodoi WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. GIÁO DỤC HỌC SINH CÁ BIỆT
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
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cabiet/:id', async (req, res) => {
  const { ho_ten, bieu_hien, bien_phap, xac_nhan_ph } = req.body;
  try {
    await pool.query(
      'UPDATE tbl_cabiet SET ho_ten=?, bieu_hien=?, bien_phap=?, xac_nhan_ph=? WHERE id=?',
      [ho_ten, bieu_hien, bien_phap, xac_nhan_ph, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cabiet/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_cabiet WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. BIÊN BẢN & KẾ HOẠCH SINH HOẠT LỚP
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sinhhoat/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_sinhhoat WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================
// 1. TỔNG HỢP XẾP LOẠI THÔNG TƯ 22
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tt22/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_danhgia_tt22 WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. XẾP LOẠI THI ĐUA ĐOÀN TRƯỜNG
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/thidua/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_thidua WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. BIÊN BẢN BÀN GIAO NGHỈ TẾT & HÈ
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bangiao/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_bangiao WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. BGH KIỂM TRA & NHẬN XÉT SỔ
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bgh/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tbl_kiemtra_bgh WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log('MySQL Backend API listening on http://localhost:5000');
});