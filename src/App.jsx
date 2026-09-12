import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Eye, EyeOff, LogIn, Sparkles, Terminal, 
  LayoutDashboard, LogOut, CheckCircle2, AlertTriangle, 
  Users, Award, Mail, Phone, School, BookOpen, KeyRound, 
  ArrowRight, UserPlus, FileText, ExternalLink, Database,
  Calendar, Clock, UserCheck, ShieldAlert, FileSpreadsheet,
  HeartHandshake, ClipboardList, TrendingUp, AlertOctagon, 
  CalendarDays, MessagesSquare, Sun, Snowflake, CheckCheck,
  ChevronLeft, ChevronRight, Home, Compass
} from 'lucide-react';

export default function App() {
  const [authView, setAuthView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Tab mặc định khi vào là Trang Chủ
  const [activeTab, setActiveTab] = useState('home'); 
  
  // Trạng thái thu gọn/mở rộng sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Đăng nhập
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form Đăng ký Giáo viên
  const [regForm, setRegForm] = useState({
    fullName: '',
    className: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);

  // Mock DB User
  const [usersDb, setUsersDb] = useState([
    {
      username: 'dev',
      password: '0000',
      role: 'developer',
      fullName: 'Quản trị viên Hệ thống',
      className: 'Phòng Kỹ Thuật',
      phone: '0900000000',
      email: 'dev@phucu.edu.vn'
    }
  ]);

  // Dữ liệu sổ lớp
  const [classState, setClassState] = useState({
    schoolName: 'TRƯỜNG THPT PHÙ CỪ',
    bookTitle: 'SỔ CÔNG TÁC CHỦ NHIỆM VÀ QUẢN LÝ HỌC SINH',
    className: '10A1',
    teacherName: '',
    teacherPhone: '',
    totalStudents: 0,
    studentsList: [],
    emulationPoints: 100,
    logs: []
  });

  const REGULATION_URL = "https://thuvienphapluat.vn/van-ban/Giao-duc/Thong-tu-22-2021-TT-BGDDT-danh-gia-hoc-sinh-trung-hoc-co-so-485242.aspx";

  useEffect(() => {
    let interval = null;
    if (authView === 'otp_verify' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [authView, otpTimer]);

  const addLog = (msg) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setClassState(prev => ({
      ...prev,
      logs: [{ time: timeStr, msg }, ...prev.logs.slice(0, 19)]
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const foundUser = usersDb.find(
      u => (u.username.toLowerCase() === loginUsername.trim().toLowerCase() || 
            u.email.toLowerCase() === loginUsername.trim().toLowerCase()) && 
           u.password === loginPassword
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setClassState(prev => ({
        ...prev,
        teacherName: foundUser.fullName,
        teacherPhone: foundUser.phone,
        className: foundUser.className,
        totalStudents: foundUser.role === 'developer' ? prev.totalStudents : 0,
        studentsList: foundUser.role === 'developer' ? prev.studentsList : [],
        emulationPoints: 100
      }));
      addLog(`User ${foundUser.fullName} đăng nhập thành công.`);
      return;
    }

    setErrorMsg('Tài khoản hoặc mật khẩu không chính xác!');
  };

  const handleStartRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (regForm.password !== regForm.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    if (regForm.password.length < 4) {
      setErrorMsg('Mật khẩu tối thiểu phải từ 4 ký tự!');
      return;
    }

    if (usersDb.some(u => u.email.toLowerCase() === regForm.email.trim().toLowerCase())) {
      setErrorMsg('Gmail này đã được đăng ký trên hệ thống!');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpTimer(60);
    setInputOtp('');
    setAuthView('otp_verify');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (inputOtp.trim() !== generatedOtp) {
      setErrorMsg('Mã OTP xác thực không đúng. Vui lòng kiểm tra lại!');
      return;
    }

    const newUser = {
      username: regForm.email.split('@')[0],
      password: regForm.password,
      role: 'gvcn',
      fullName: regForm.fullName.trim(),
      className: regForm.className.trim().toUpperCase(),
      phone: regForm.phone.trim(),
      email: regForm.email.trim()
    };

    setUsersDb(prev => [...prev, newUser]);
    setSuccessMsg('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
    setAuthView('login');
    setLoginUsername(newUser.email);
    setLoginPassword('');
    setRegForm({ fullName: '', className: '', phone: '', email: '', password: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    addLog(`Đăng xuất: ${currentUser?.fullName}`);
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    setActiveTab('home');
  };

  const menuCategories = [
    {
      group: "ĐIỀU HÀNH & QUY ĐỊNH",
      items: [
        { id: 'home', label: 'Trang chủ cổng trường', icon: <Home className="w-4 h-4" /> },
        { id: 'dashboard', label: 'Bàn làm việc tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'regulation', label: 'Thông tư 22/2021/TT-BGDĐT', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      group: "HỒ SƠ TỔ CHỨC LỚP",
      items: [
        { id: 'student_profile', label: 'Sơ yếu lý lịch học sinh', icon: <Users className="w-4 h-4" /> },
        { id: 'parent_committee', label: 'Ban đại diện cha mẹ học sinh', icon: <HeartHandshake className="w-4 h-4" /> },
        { id: 'class_leaders', label: 'Cán bộ lớp - Cán bộ Đoàn', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'team_groups', label: 'Danh sách chia theo tổ', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'seating_chart', label: 'Sơ đồ lớp học', icon: <School className="w-4 h-4" /> }
      ]
    },
    {
      group: "THỜI KHOÁ BIỂU & NỀ NẾP",
      items: [
        { id: 'schedule_main', label: 'Thời khoá biểu chính khoá', icon: <Calendar className="w-4 h-4" /> },
        { id: 'schedule_extra', label: 'Thời khoá biểu buổi 2', icon: <Clock className="w-4 h-4" /> },
        { id: 'special_education', label: 'Giáo dục học sinh cá biệt', icon: <AlertOctagon className="w-4 h-4" /> },
        { id: 'study_tracking', label: 'Theo dõi học tập & rèn luyện', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'class_meeting', label: 'Nội dung sinh hoạt lớp', icon: <ClipboardList className="w-4 h-4" /> }
      ]
    },
    {
      group: "KẾ HOẠCH & BÁO CÁO",
      items: [
        { id: 'annual_plan', label: 'Kế hoạch công tác chủ nhiệm', icon: <CalendarDays className="w-4 h-4" /> },
        { id: 'monthly_plan', label: 'Kế hoạch công tác tháng', icon: <Calendar className="w-4 h-4" /> },
        { id: 'evaluation_summary', label: 'Tổng hợp kết quả đánh giá', icon: <CheckCircle2 className="w-4 h-4" /> },
        { id: 'emulation_rank', label: 'Xếp loại thi đua của lớp', icon: <Award className="w-4 h-4" /> },
        { id: 'summer_retake', label: 'HS rèn luyện hè / Kiểm tra lại', icon: <ShieldAlert className="w-4 h-4" /> }
      ]
    },
    {
      group: "BIÊN BẢN & BÀN GIAO",
      items: [
        { id: 'meeting_minutes', label: 'Nội dung họp PHHS & Họp trường', icon: <MessagesSquare className="w-4 h-4" /> },
        { id: 'handover_tet', label: 'Biên bản bàn giao nghỉ Tết', icon: <Snowflake className="w-4 h-4" /> },
        { id: 'handover_summer', label: 'Biên bản bàn giao sinh hoạt Hè', icon: <Sun className="w-4 h-4" /> },
        { id: 'admin_inspection', label: 'BGH kiểm tra & nhận xét sổ', icon: <CheckCheck className="w-4 h-4" /> }
      ]
    }
  ];

  // ==========================================
  // VIEW: AUTH
  // ==========================================
  if (!currentUser) {
    return (
      <div 
        className="min-h-screen text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-cyan-500 selection:text-white bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url('./bg-khaigiang.jpg')` }}
      >
        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
          <img 
            src="./logo-phucu.png" 
            alt="Logo Trường THPT Phù Cừ" 
            className="w-12 h-12 object-contain drop-shadow-md"
          />
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white uppercase drop-shadow">
              TRƯỜNG THPT PHÙ CỪ
            </h2>
            <span className="text-[11px] text-cyan-300 font-mono drop-shadow">
              Năm học 2026 - 2027
            </span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl shadow-black">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold tracking-wide uppercase inline-block mb-3">
              TRƯỜNG THPT PHÙ CỪ
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white leading-snug">
              {classState.bookTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Hệ thống chuyển đổi số & quản lý hồ sơ chủ nhiệm
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {authView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tài khoản hoặc Gmail
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập hoặc Gmail..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 mt-2 text-sm"
              >
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>Đăng nhập</span>
              </button>

              <div className="pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Chưa có tài khoản giáo viên?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setAuthView('register');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 ml-1 transition"
                  >
                    Đăng ký tài khoản mới
                  </button>
                </p>
              </div>
            </form>
          )}

          {authView === 'register' && (
            <form onSubmit={handleStartRegister} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Họ và tên GVCN
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({...regForm, fullName: e.target.value})}
                    placeholder="Ví dụ: Thầy Hoàng Văn A"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Lớp chủ nhiệm
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.className}
                    onChange={(e) => setRegForm({...regForm, className: e.target.value})}
                    placeholder="Ví dụ: 10A1"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                    placeholder="09xx xxx xxx"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Gmail
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Mật khẩu đăng ký
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                      placeholder="Mật khẩu"
                      className="w-full pl-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                      placeholder="Nhập lại"
                      className="w-full pl-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 mt-3 text-sm"
              >
                <span>Nhận mã xác thực OTP</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ← Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}

          {authView === 'otp_verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-center">
                <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300">Mã OTP 6 số đã được gửi đến Gmail:</p>
                <p className="text-sm font-bold text-cyan-400 mt-0.5">{regForm.email}</p>
                <div className="mt-3 p-2 bg-cyan-950/60 border border-cyan-500/30 rounded-lg text-left">
                  <span className="text-[11px] text-cyan-300 block font-mono">
                    [Mô phỏng Email Service]: Mã OTP của bạn là: <b className="text-white text-sm tracking-widest">{generatedOtp}</b>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
                  Nhập mã OTP xác nhận
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  placeholder="------"
                  className="w-full text-center tracking-[0.5em] text-lg font-mono py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="text-center text-xs text-slate-500">
                Hiệu lực trong: <span className="text-cyan-400 font-mono font-semibold">{otpTimer}s</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Xác nhận & Khởi tạo lớp</span>
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN PANEL (CÓ ẨN / HIỆN SIDEBAR)
  // ==========================================
  return (
    <div 
      className="min-h-screen text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-white bg-cover bg-center bg-no-repeat bg-fixed relative overflow-x-hidden"
      style={{ backgroundImage: `url('./bg-khaigiang.jpg')` }}
    >
      {/* 
        CHÚ Ý: Ở Trang Chủ ('home') giữ ảnh nguyên bản 100% không làm tối.
        Khi chuyển sang các tab nghiệp vụ khác mới phủ lớp nền tối để dễ đọc văn bản.
      */}
      {activeTab !== 'home' && (
        <div className="fixed inset-0 bg-slate-950/80 pointer-events-none z-0" />
      )}

      {/* NÚT THU GỌN / MỞ RỘNG SIDEBAR [<] [>] */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? "Ẩn danh mục [<]" : "Mở danh mục [>]"}
        className={`fixed top-4 z-30 p-2 rounded-xl border border-slate-700 bg-slate-900/90 text-cyan-400 hover:bg-slate-800 transition-all duration-300 shadow-xl flex items-center gap-1.5 ${
          isSidebarOpen ? 'left-[296px]' : 'left-4'
        }`}
      >
        {isSidebarOpen ? (
          <>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold pr-1">[&lt;]</span>
          </>
        ) : (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[11px] font-mono font-bold pr-1">[&gt;]</span>
          </>
        )}
      </button>

      {/* SIDEBAR CÓ THỂ ẨN / HIỆN */}
      <aside 
        className={`w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute'
        }`}
      >
        <div className="overflow-y-auto p-4 space-y-6">
          
          {/* Logo trường góc trên bên trái Sidebar */}
          <div className="flex items-center gap-3 px-2">
            <img 
              src="./logo-phucu.png" 
              alt="Logo Trường THPT Phù Cừ" 
              className="w-10 h-10 object-contain drop-shadow"
            />
            <div className="overflow-hidden">
              <h2 className="font-bold text-xs text-white uppercase truncate">
                TRƯỜNG THPT PHÙ CỪ
              </h2>
              <span className="text-[10px] text-cyan-400 font-mono block">
                {currentUser.role === 'developer' ? 'Root Debug' : `Lớp: ${classState.className}`}
              </span>
            </div>
          </div>

          {/* Render các nhóm menu */}
          <div className="space-y-5">
            {menuCategories.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <p className="px-2.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  {group.group}
                </p>
                {group.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm font-semibold'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}

            {currentUser.role === 'developer' && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <p className="px-2.5 text-[10px] font-bold text-amber-500 tracking-wider uppercase">
                  ADMIN DEBUG
                </p>
                <button
                  onClick={() => setActiveTab('dev_panel')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    activeTab === 'dev_panel'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Dev Console</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
              {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'GV'}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition text-xs font-semibold border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10">

        {/* ========================================================================= */}
        {/* TAB TRANG CHỦ: CHỈ CÓ ẢNH TRƯỜNG VÀ CÁC PLACEHOLDER HOÀN TOÀN TRONG SUỐT */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div className="max-w-5xl space-y-6 pt-12 md:pt-4">
            
            {/* Header Trong Suốt Hoàn Toàn (Chỉ viền mờ và đổ bóng chữ) */}
            <header className="p-6 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px]">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest block mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {classState.schoolName}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {classState.bookTitle}
              </h1>
              <p className="text-sm text-slate-200 mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                Chào mừng Thầy/Cô <b className="text-cyan-300">{classState.teacherName || currentUser.fullName}</b> đến với cổng thông tin điện tử lớp <b className="text-amber-300">{classState.className}</b>.
              </p>
            </header>

            {/* Các Card Placeholder Trong Suốt (bg-transparent) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px] transition hover:border-cyan-400/50">
                <div className="flex items-center justify-between text-slate-200 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider drop-shadow">HỆ THỐNG SỔ</span>
                  <BookOpen className="w-5 h-5 text-cyan-300 drop-shadow" />
                </div>
                <div className="text-lg font-bold text-white drop-shadow">Chủ Nhiệm Điện Tử</div>
                <p className="text-xs text-slate-300 mt-1 drop-shadow">
                  Tích hợp 19 phân hệ chuẩn hoá theo quy chế THPT
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px] transition hover:border-cyan-400/50">
                <div className="flex items-center justify-between text-slate-200 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider drop-shadow">ĐÁNH GIÁ THPT</span>
                  <Award className="w-5 h-5 text-amber-300 drop-shadow" />
                </div>
                <div className="text-lg font-bold text-white drop-shadow">Thông Tư 22/2021</div>
                <p className="text-xs text-slate-300 mt-1 drop-shadow">
                  Tra cứu quy chuẩn đánh giá học lực & hạnh kiểm
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px] transition hover:border-cyan-400/50">
                <div className="flex items-center justify-between text-slate-200 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider drop-shadow">NĂM HỌC HIỆN TẠI</span>
                  <Compass className="w-5 h-5 text-emerald-300 drop-shadow" />
                </div>
                <div className="text-lg font-bold text-white drop-shadow">2026 - 2027</div>
                <p className="text-xs text-slate-300 mt-1 drop-shadow">
                  Sẵn sàng đồng bộ hồ sơ lớp học trực tuyến
                </p>
              </div>
            </div>

            {/* Placeholder bảng tin nhanh trong suốt */}
            <div className="p-6 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white drop-shadow">Bắt đầu quản lý lớp học ngay</h3>
                <p className="text-xs text-slate-300 mt-0.5 drop-shadow">
                  Nhấn vào Bàn làm việc để quản lý danh sách học sinh và điểm danh
                </p>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 rounded-xl bg-cyan-500/80 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg"
              >
                <span>Mở Bàn làm việc</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB BÀN LÀM VIỆC (RIÊNG BIỆT VỚI TRANG CHỦ) */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl space-y-6 pt-12 md:pt-0">
            <header className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                  {classState.schoolName}
                </span>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {classState.bookTitle}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Lớp: <b className="text-slate-200">{classState.className}</b> • GVCN: <b className="text-slate-200">{classState.teacherName || currentUser.fullName}</b> {classState.teacherPhone && `(${classState.teacherPhone})`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                  Năm học 2026 - 2027
                </span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">SĨ SỐ HỌC SINH</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white">{classState.totalStudents} em</div>
                <div className="text-xs text-slate-500 mt-1">
                  {classState.totalStudents === 0 ? 'Lớp mới - Chưa có dữ liệu học sinh' : 'Đang cập nhật danh sách'}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">ĐIỂM THI ĐUA GỐC</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">{classState.emulationPoints} đ</div>
                <div className="text-xs text-amber-400/80 mt-1">Chuẩn nề nếp thi đua đầu tuần</div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Danh sách học sinh lớp {classState.className}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Thêm mới và đồng bộ danh sách học sinh</p>
                </div>
                <button 
                  onClick={() => {
                    const name = prompt('Nhập họ và tên học sinh mới:');
                    if (name && name.trim()) {
                      setClassState(prev => ({
                        ...prev,
                        totalStudents: prev.totalStudents + 1,
                        studentsList: [...prev.studentsList, { id: Date.now(), name: name.trim() }]
                      }));
                      addLog(`Đã thêm học sinh: ${name.trim()}`);
                    }
                  }}
                  className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm học sinh</span>
                </button>
              </div>

              {classState.studentsList.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-300">Lớp học hiện chưa có học sinh nào</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Thầy/Cô vui lòng nhấn nút "Thêm học sinh" ở trên để bắt đầu khởi tạo sổ chủ nhiệm.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4 rounded-l-lg">STT</th>
                        <th className="py-2.5 px-4">Họ và Tên</th>
                        <th className="py-2.5 px-4 rounded-r-lg text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {classState.studentsList.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-medium text-white">{st.name}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button 
                              onClick={() => {
                                setClassState(prev => ({
                                  ...prev,
                                  totalStudents: prev.totalStudents - 1,
                                  studentsList: prev.studentsList.filter(s => s.id !== st.id)
                                }));
                                addLog(`Đã xóa học sinh: ${st.name}`);
                              }}
                              className="text-red-400 hover:text-red-300 text-[11px]"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* THÔNG TƯ 22/2021 IFRAME */}
        {activeTab === 'regulation' && (
          <div className="max-w-6xl space-y-4 pt-12 md:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Thông tư 22/2021/TT-BGDĐT - Quy định đánh giá học sinh THCS & THPT
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nguồn văn bản trực tuyến từ Thư Viện Pháp Luật
                </p>
              </div>
              <a
                href={REGULATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 border border-slate-700"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full h-[750px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={REGULATION_URL}
                title="Thông tư 22/2021/TT-BGDĐT"
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        )}

        {/* SƠ YẾU LÝ LỊCH HỌC SINH */}
        {activeTab === 'student_profile' && (
          <ModulePreviewContainer title="SƠ YẾU LÝ LỊCH HỌC SINH" desc="Quản lý thông tin cá nhân, ngày sinh, dân tộc, nơi ở và thông tin phụ huynh">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">STT</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Ngày sinh</th>
                  <th className="p-3">Giới tính</th>
                  <th className="p-3">Họ tên Cha/Mẹ</th>
                  <th className="p-3">SĐT Liên hệ</th>
                  <th className="p-3">Địa chỉ thường trú</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-center text-slate-500">
                  <td colSpan="7" className="py-12">Chưa có dữ liệu lý lịch học sinh</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* BAN ĐẠI DIỆN CHA MẸ HỌC SINH */}
        {activeTab === 'parent_committee' && (
          <ModulePreviewContainer title="DANH SÁCH BAN ĐẠI DIỆN HỘI CHA MẸ HỌC SINH" desc="Danh sách Ban đại diện PHHS lớp năm học 2026 - 2027">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">STT</th>
                  <th className="p-3">Họ và tên phụ huynh</th>
                  <th className="p-3">Phụ huynh của em</th>
                  <th className="p-3">Chức vụ trong Ban</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3">Địa chỉ / Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-center text-slate-500">
                  <td colSpan="6" className="py-12">Chưa thiết lập danh sách ban đại diện cha mẹ học sinh</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* CÁN BỘ LỚP CÁN BỘ ĐOÀN */}
        {activeTab === 'class_leaders' && (
          <ModulePreviewContainer title="DANH SÁCH CÁN BỘ LỚP CÁN BỘ ĐOÀN" desc="Ban cán sự lớp và Ban chấp hành Chi đoàn nhiệm kỳ mới">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-3">Ban cán sự lớp</h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Lớp trưởng:</span> <b className="text-slate-300">[Chưa phân công]</b></div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Lớp phó Học tập:</span> <b className="text-slate-300">[Chưa phân công]</b></div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Lớp phó Lao động:</span> <b className="text-slate-300">[Chưa phân công]</b></div>
                  <div className="flex justify-between py-1.5"><span>Lớp phó Phong trào:</span> <b className="text-slate-300">[Chưa phân công]</b></div>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase mb-3">Ban chấp hành Chi đoàn</h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Bí thư Chi đoàn:</span> <b className="text-slate-300">[Chưa phân công]</b></div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Phó Bí thư:</span> <b className="text-slate-300">[Chưa phân công]</b></div>
                  <div className="flex justify-between py-1.5"><span>Ủy viên BCH:</span> <b className="text-slate-300">[Chưa phân công]</b></div>
                </div>
              </div>
            </div>
          </ModulePreviewContainer>
        )}

        {/* DANH SÁCH CHIA THEO TỔ */}
        {activeTab === 'team_groups' && (
          <ModulePreviewContainer title="DANH SÁCH HS CHIA THEO TỔ" desc="Phân chia 4 tổ thi đua học tập và trực nhật">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(t => (
                <div key={t} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase mb-2">Tổ {t}</h4>
                  <p className="text-[11px] text-slate-500 mb-3">Tổ trưởng: [Chưa chọn]</p>
                  <div className="py-8 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                    Chưa có tổ viên
                  </div>
                </div>
              ))}
            </div>
          </ModulePreviewContainer>
        )}

        {/* SƠ ĐỒ LỚP */}
        {activeTab === 'seating_chart' && (
          <ModulePreviewContainer title="SƠ ĐỒ LỚP" desc="Bố trí vị trí bàn ghế và chỗ ngồi học sinh theo dãy">
            <div className="w-full bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-8">
              <div className="py-2.5 px-8 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg inline-block border border-slate-700">
                BẢNG VIẾT LỚP HỌC & BÀN GIÁO VIÊN
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {['Dãy 1', 'Dãy 2', 'Dãy 3', 'Dãy 4'].map((d, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="text-[11px] font-bold text-cyan-400">{d}</div>
                    {[1, 2, 3, 4].map(b => (
                      <div key={b} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-500">
                        Bàn {b} (Trống)
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </ModulePreviewContainer>
        )}

        {/* THỜI KHOÁ BIỂU CHÍNH KHOÁ */}
        {activeTab === 'schedule_main' && (
          <ModulePreviewContainer title="THỜI KHOÁ BIỂU CHÍNH KHOÁ" desc="Lịch học các tiết buổi sáng từ Thứ Hai đến Thứ Bảy">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 text-left">Tiết</th>
                    <th className="p-3">Thứ 2</th>
                    <th className="p-3">Thứ 3</th>
                    <th className="p-3">Thứ 4</th>
                    <th className="p-3">Thứ 5</th>
                    <th className="p-3">Thứ 6</th>
                    <th className="p-3">Thứ 7</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[1, 2, 3, 4, 5].map(p => (
                    <tr key={p} className="hover:bg-slate-800/40">
                      <td className="p-3 text-left font-bold text-slate-500">Tiết {p}</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModulePreviewContainer>
        )}

        {/* THỜI KHOÁ BIỂU BUỔI 2 */}
        {activeTab === 'schedule_extra' && (
          <ModulePreviewContainer title="THỜI KHOÁ BIỂU BUỔI 2" desc="Lịch học phụ đạo, tăng tiết và hoạt động giáo dục buổi chiều">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 text-left">Tiết chiều</th>
                    <th className="p-3">Thứ 2</th>
                    <th className="p-3">Thứ 3</th>
                    <th className="p-3">Thứ 4</th>
                    <th className="p-3">Thứ 5</th>
                    <th className="p-3">Thứ 6</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[1, 2, 3].map(p => (
                    <tr key={p} className="hover:bg-slate-800/40">
                      <td className="p-3 text-left font-bold text-slate-500">Tiết {p}</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                      <td className="p-3 text-slate-600">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModulePreviewContainer>
        )}

        {/* GIÁO DỤC HS CÁ BIỆT */}
        {activeTab === 'special_education' && (
          <ModulePreviewContainer title="GIÁO DỤC HS CÁ BIỆT" desc="Theo dõi, uốn nắn và phối hợp phụ huynh với học sinh cần hỗ trợ đặc biệt">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">STT</th>
                  <th className="p-3">Họ và tên học sinh</th>
                  <th className="p-3">Biểu hiện / Vi phạm</th>
                  <th className="p-3">Biện pháp giáo dục của GVCN</th>
                  <th className="p-3">Kết quả tiến bộ</th>
                  <th className="p-3">Xác nhận của PHHS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-center text-slate-500">
                  <td colSpan="6" className="py-12">Chưa có học sinh trong danh sách theo dõi đặc biệt</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* KẾ HOẠCH CÔNG TÁC CHỦ NHIỆM */}
        {activeTab === 'annual_plan' && (
          <ModulePreviewContainer title="KẾ HOẠCH CÔNG TÁC CHỦ NHIỆM" desc="Đặc điểm tình hình, mục tiêu phấn đấu, các chỉ tiêu học lực và hạnh kiểm cả năm">
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white uppercase text-xs">1. Thuận lợi và khó khăn</h4>
                <p className="text-slate-500 italic">[Chưa nhập nội dung phân tích đặc điểm đầu năm]</p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white uppercase text-xs">2. Mục tiêu và chỉ tiêu phấn đấu</h4>
                <p className="text-slate-500 italic">[Chưa nhập chỉ tiêu xếp loại hạnh kiểm, học lực theo Thông tư 22]</p>
              </div>
            </div>
          </ModulePreviewContainer>
        )}

        {/* CÔNG TÁC THÁNG */}
        {activeTab === 'monthly_plan' && (
          <ModulePreviewContainer title="CÔNG TÁC THÁNG" desc="Trọng tâm công tác từ Tháng 9 đến Tháng 5 trong năm học">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[9, 10, 11, 12, 1, 2, 3, 4, 5].map(m => (
                <div key={m} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-cyan-400 text-xs uppercase">Tháng {m}</h4>
                  <p className="text-[11px] text-slate-500">[Chưa cập nhật nội dung trọng tâm tháng]</p>
                </div>
              ))}
            </div>
          </ModulePreviewContainer>
        )}

        {/* NỘI DUNG SINH HOẠT LỚP */}
        {activeTab === 'class_meeting' && (
          <ModulePreviewContainer title="NỘI DUNG SINH HOẠT LỚP" desc="Đánh giá nề nếp tuần, khen thưởng tổ xuất sắc và kế hoạch tuần tới">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Tuần</th>
                  <th className="p-3">Ngày sinh hoạt</th>
                  <th className="p-3">Chủ trì</th>
                  <th className="p-3">Nội dung chính / Đánh giá</th>
                  <th className="p-3">Kế hoạch tuần tới</th>
                  <th className="p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-center text-slate-500">
                  <td colSpan="6" className="py-12">Chưa có biên bản tiết sinh hoạt lớp nào</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* THEO DÕI TÌNH HÌNH HỌC TẬP VÀ RÈN LUYỆN CỦA HS */}
        {activeTab === 'study_tracking' && (
          <ModulePreviewContainer title="THEO DÕI TÌNH HÌNH HỌC TẬP VÀ RÈN LUYỆN CỦA HS" desc="Ghi chép điểm số, vi phạm nề nếp và các biểu hiện tích cực hàng ngày">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Ngày</th>
                  <th className="p-3">Họ tên HS</th>
                  <th className="p-3">Môn học</th>
                  <th className="p-3">Điểm / Nhận xét</th>
                  <th className="p-3">Lỗi vi phạm / Tuyên dương</th>
                  <th className="p-3">Người ghi nhận</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-center text-slate-500">
                  <td colSpan="6" className="py-12">Chưa có bản ghi theo dõi học tập & rèn luyện</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ XẾP LOẠI HS */}
        {activeTab === 'evaluation_summary' && (
          <ModulePreviewContainer title="TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ XẾP LOẠI HS" desc="Bảng tổng hợp xếp loại Rèn luyện (Hạnh kiểm) và Học tập (Học lực) cuối kỳ">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">STT</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Học tập HK I</th>
                  <th className="p-3">Rèn luyện HK I</th>
                  <th className="p-3">Học tập Cả năm</th>
                  <th className="p-3">Rèn luyện Cả năm</th>
                  <th className="p-3">Danh hiệu</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-center text-slate-500">
                  <td colSpan="7" className="py-12">Chưa có kết quả tổng hợp xếp loại học kỳ</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* XẾP LOẠI THI ĐUA CỦA LỚP */}
        {activeTab === 'emulation_rank' && (
          <ModulePreviewContainer title="XẾP LOẠI THI ĐUA CỦA LỚP" desc="Điểm thi đua Đoàn trường chấm hàng tuần và xếp hạng toàn trường">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Tuần</th>
                  <th className="p-3">Điểm thi đua</th>
                  <th className="p-3">Hạng Khối</th>
                  <th className="p-3">Hạng Toàn trường</th>
                  <th className="p-3">Cờ thi đua</th>
                  <th className="p-3">Lỗi trừ điểm / Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-center text-slate-500">
                  <td colSpan="6" className="py-12">Chưa có dữ liệu chấm thi đua các tuần</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* DANH SÁCH HỌC SINH KHÔNG ĐƯỢC LÊN LỚP, KIỂM TRA LẠI HOẶC RÈN LUYỆN TRONG HÈ */}
        {activeTab === 'summer_retake' && (
          <ModulePreviewContainer title="DANH SÁCH HỌC SINH KHÔNG ĐƯỢC LÊN LỚP, KIỂM TRA LẠI HOẶC RÈN LUYỆN TRONG HÈ" desc="Tổng kết các trường hợp cần rèn luyện bổ sung sau năm học">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">STT</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Môn kiểm tra lại</th>
                  <th className="p-3">Diện rèn luyện hè</th>
                  <th className="p-3">Điểm KT lại</th>
                  <th className="p-3">Kết quả sau hè</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800 text-center text-slate-500">
                  <td colSpan="6" className="py-12">Lớp không có học sinh phải kiểm tra lại hoặc rèn luyện hè</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* NỘI DUNG CUỘC HỌP VỚI CHA MẸ HỌC SINH VÀ HỌP GVCN CỦA TRƯỜNG */}
        {activeTab === 'meeting_minutes' && (
          <ModulePreviewContainer title="NỘI DUNG CUỘC HỌP VỚI CHA MẸ HỌC SINH VÀ HỌP GVCN CỦA TRƯỜNG" desc="Ghi chép các kết luận trong phiên họp BGH và các kỳ họp Cha mẹ học sinh">
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white mb-1 uppercase">1. Họp PHHS Đầu năm học (Tháng 9)</h4>
                <p className="text-slate-500 italic">[Chưa ghi chép biên bản cuộc họp]</p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white mb-1 uppercase">2. Họp PHHS Sơ kết Học kỳ I (Tháng 1)</h4>
                <p className="text-slate-500 italic">[Chưa ghi chép biên bản cuộc họp]</p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white mb-1 uppercase">3. Họp PHHS Tổng kết Năm học (Tháng 5)</h4>
                <p className="text-slate-500 italic">[Chưa ghi chép biên bản cuộc họp]</p>
              </div>
            </div>
          </ModulePreviewContainer>
        )}

        {/* BIÊN BẢN BÀN GIAO HS VỀ NGHỈ TẾT NGUYÊN ĐÁN TẠI GIA ĐÌNH VÀ ĐỊA PHƯƠNG */}
        {activeTab === 'handover_tet' && (
          <ModulePreviewContainer title="BIÊN BẢN BÀN GIAO HS VỀ NGHỈ TẾT NGUYÊN ĐÁN TẠI GIA ĐÌNH VÀ ĐỊA PHƯƠNG" desc="Bàn giao nề nếp, cam kết an toàn giao thông và pháo nổ dịp Tết Nguyên Đán">
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Thời gian bàn giao: <b>[Chưa thiết lập]</b></span>
                <span>Tổng số học sinh bàn giao: <b>{classState.totalStudents} em</b></span>
              </div>
              <p>Nội dung cam kết: 100% học sinh chấp hành nghiêm chỉnh luật an toàn giao thông, không tàng trữ, buôn bán hoặc sử dụng pháo nổ trái phép; Giữ gìn an ninh trật tự tại địa phương và quay lại trường đúng thời gian quy định.</p>
              <div className="pt-8 flex justify-around text-center text-slate-400">
                <div>
                  <p className="font-bold text-slate-200">ĐẠI DIỆN ĐỊA PHƯƠNG / PHHS</p>
                  <p className="text-[10px] mt-1 text-slate-500">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">GIÁO VIÊN CHỦ NHIỆM</p>
                  <p className="text-[10px] mt-1 text-slate-500">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>
          </ModulePreviewContainer>
        )}

        {/* BIÊN BẢN BÀN GIAO HS VỀ SINH HOẠT HÈ TẠI GIA ĐÌNH VÀ ĐỊA PHƯƠNG */}
        {activeTab === 'handover_summer' && (
          <ModulePreviewContainer title="BIÊN BẢN BÀN GIAO HS VỀ SINH HOẠT HÈ TẠI GIA ĐÌNH VÀ ĐỊA PHƯƠNG" desc="Bàn giao học sinh về Đoàn xã / Đoàn thị trấn sinh hoạt trong kỳ nghỉ hè">
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Thời gian bàn giao hè: <b>[Tháng 5/2027]</b></span>
                <span>Sĩ số bàn giao: <b>{classState.totalStudents} em</b></span>
              </div>
              <p>Bàn giao đoàn viên, thanh niên về địa bàn dân cư tham gia Chiến dịch Hoa Phượng Đỏ, phòng chống đuối nước và các hoạt động tình nguyện hè do Huyện Đoàn phát động.</p>
              <div className="pt-8 flex justify-around text-center text-slate-400">
                <div>
                  <p className="font-bold text-slate-200">BCH ĐOÀN XÃ / THỊ TRẤN TIẾP NHẬN</p>
                  <p className="text-[10px] mt-1 text-slate-500">(Ký tên, đóng dấu)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-200">GIÁO VIÊN CHỦ NHIỆM</p>
                  <p className="text-[10px] mt-1 text-slate-500">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>
          </ModulePreviewContainer>
        )}

        {/* KIỂM TRA VÀ NHẬN XÉT CUỐI HỌC KỲ, CUỐI NĂM CỦA BGH VỀ SỬ DỤNG SỔ CÔNG TÁC CHỦ NHIỆM */}
        {activeTab === 'admin_inspection' && (
          <ModulePreviewContainer title="KIỂM TRA VÀ NHẬN XÉT CUỐI HỌC KỲ, CUỐI NĂM CỦA BGH VỀ SỬ DỤNG SỔ CÔNG TÁC CHỦ NHIỆM" desc="Ý kiến chỉ đạo, nhận xét phê duyệt hồ sơ từ Ban Giám Hiệu">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Đợt kiểm tra</th>
                  <th className="p-3">Ngày duyệt</th>
                  <th className="p-3">Nhận xét về tiến độ & nề nếp</th>
                  <th className="p-3">Xếp loại sổ</th>
                  <th className="p-3">Người kiểm tra (BGH)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">Cuối Tháng 10 (Giữa HK I)</td>
                  <td className="p-3 text-slate-500">-</td>
                  <td className="p-3 text-slate-500">[Chưa kiểm tra]</td>
                  <td className="p-3 text-slate-500">-</td>
                  <td className="p-3 text-slate-500">-</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">Sơ kết Học kỳ I</td>
                  <td className="p-3 text-slate-500">-</td>
                  <td className="p-3 text-slate-500">[Chưa kiểm tra]</td>
                  <td className="p-3 text-slate-500">-</td>
                  <td className="p-3 text-slate-500">-</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">Tổng kết Cuối năm học</td>
                  <td className="p-3 text-slate-500">-</td>
                  <td className="p-3 text-slate-500">[Chưa kiểm tra]</td>
                  <td className="p-3 text-slate-500">-</td>
                  <td className="p-3 text-slate-500">-</td>
                </tr>
              </tbody>
            </table>
          </ModulePreviewContainer>
        )}

        {/* DEV PANEL */}
        {activeTab === 'dev_panel' && currentUser.role === 'developer' && (
          <div className="max-w-5xl space-y-6 pt-12 md:pt-0">
            <header className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-amber-400" />
                <div>
                  <h1 className="text-base font-bold text-white">Developer Debug Console</h1>
                  <p className="text-xs text-amber-400/80">Can thiệp State & Quản lý danh sách tài khoản TRƯỜNG THPT PHÙ CỪ</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                ROOT PRIVILEGES
              </span>
            </header>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Danh sách tài khoản trong Mock DB ({usersDb.length})
              </h3>
              <div className="space-y-2">
                {usersDb.map((u, i) => (
                  <div key={i} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{u.fullName}</span> ({u.role}) • Lớp: <span className="text-cyan-400">{u.className}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">Email: {u.email} | SĐT: {u.phone}</div>
                    </div>
                    <code className="text-slate-500 font-mono text-[11px]">pass: {u.password}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Realtime Event Logs
                </span>
                <span className="text-[10px] text-slate-500">{classState.logs.length} sự kiện</span>
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto text-xs text-slate-300">
                {classState.logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-slate-500">[{log.time}]</span>
                    <span className="text-cyan-400">&gt;</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Khung container hiển thị các phân hệ nghiệp vụ khác
function ModulePreviewContainer({ title, desc, children }) {
  return (
    <div className="max-w-6xl space-y-4 pt-12 md:pt-0">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}