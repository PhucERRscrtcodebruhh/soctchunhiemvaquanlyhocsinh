import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, CheckCircle2, AlertTriangle, Mail, Phone, School, KeyRound, ArrowRight } from 'lucide-react';

export default function AuthModal({ onLoginSuccess, classTitle }) {
  const [authView, setAuthView] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regForm, setRegForm] = useState({
    fullName: '', className: '', phone: '', email: '', password: '', confirmPassword: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mock DB User nội bộ
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

  useEffect(() => {
    let interval = null;
    if (authView === 'otp_verify' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [authView, otpTimer]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const user = usersDb.find(
      u => (u.username.toLowerCase() === loginUsername.trim().toLowerCase() ||
            u.email.toLowerCase() === loginUsername.trim().toLowerCase()) &&
           u.password === loginPassword
    );
    if (user) {
      onLoginSuccess(user);
    } else {
      setErrorMsg('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleStartRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (regForm.password !== regForm.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
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
    if (inputOtp.trim() !== generatedOtp) {
      setErrorMsg('Mã OTP không đúng!');
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
    setSuccessMsg('Đăng ký tài khoản GVCN thành công! Mời đăng nhập.');
    setAuthView('login');
    setLoginUsername(newUser.email);
  };

  return (
    <div 
      className="min-h-screen text-slate-100 flex items-center justify-center p-4 font-sans bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('./bg-khaigiang.jpg')` }}
    >
      <div className="absolute inset-0 bg-slate-950/60" />

      {/* Header Logo trường */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <img src="./logo-phucu.png" alt="Logo Trường THPT Phù Cừ" className="w-12 h-12 object-contain drop-shadow-md" />
        <div>
          <h2 className="text-sm font-bold tracking-wide text-white uppercase drop-shadow">TRƯỜNG THPT PHÙ CỪ</h2>
          <span className="text-[11px] text-cyan-300 font-mono drop-shadow">Năm học 2026 - 2027</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl shadow-black">
        <div className="text-center mb-6">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold tracking-wide uppercase inline-block mb-3">
            TRƯỜNG THPT PHÙ CỪ
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white leading-snug">{classTitle}</h1>
          <p className="text-xs text-slate-400 mt-1">Hệ thống chuyển đổi số & quản lý hồ sơ chủ nhiệm</p>
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tài khoản hoặc Gmail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><User className="w-4 h-4" /></span>
                <input
                  type="text" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập hoặc Gmail..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Lock className="w-4 h-4" /></span>
                <input
                  type={showLoginPassword ? 'text' : 'password'} required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300">
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
              <LogIn className="w-4 h-4" /> Đăng nhập
            </button>
            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Chưa có tài khoản giáo viên?{' '}
                <button type="button" onClick={() => { setErrorMsg(''); setSuccessMsg(''); setAuthView('register'); }} className="text-cyan-400 hover:text-cyan-300 font-semibold underline ml-1">
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </form>
        )}

        {authView === 'register' && (
          <form onSubmit={handleStartRegister} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Họ và tên GVCN</label>
                <input type="text" required value={regForm.fullName} onChange={(e) => setRegForm({...regForm, fullName: e.target.value})} placeholder="Ví dụ: Thầy Hoàng Văn A" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lớp chủ nhiệm</label>
                <input type="text" required value={regForm.className} onChange={(e) => setRegForm({...regForm, className: e.target.value})} placeholder="Ví dụ: 10A1" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Số điện thoại</label>
                <input type="tel" required value={regForm.phone} onChange={(e) => setRegForm({...regForm, phone: e.target.value})} placeholder="09xx xxx xxx" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Gmail</label>
                <input type="email" required value={regForm.email} onChange={(e) => setRegForm({...regForm, email: e.target.value})} placeholder="email@gmail.com" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mật khẩu</label>
                <input type={showRegPassword ? 'text' : 'password'} required value={regForm.password} onChange={(e) => setRegForm({...regForm, password: e.target.value})} placeholder="Mật khẩu" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nhập lại MK</label>
                <input type={showConfirmPassword ? 'text' : 'password'} required value={regForm.confirmPassword} onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})} placeholder="Xác nhận MK" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 mt-3">
              Nhận mã OTP <ArrowRight className="w-4 h-4" />
            </button>
            <div className="pt-2 text-center">
              <button type="button" onClick={() => setAuthView('login')} className="text-xs text-slate-400 hover:text-slate-200">← Quay lại Đăng nhập</button>
            </div>
          </form>
        )}

        {authView === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-center">
              <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300">Mã OTP gửi đến: <b className="text-cyan-400">{regForm.email}</b></p>
              <div className="mt-3 p-2 bg-cyan-950/60 border border-cyan-500/30 rounded-lg text-left">
                <span className="text-[11px] text-cyan-300 font-mono">[Email Simulation]: OTP kích hoạt là: <b className="text-white text-sm">{generatedOtp}</b></span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">Nhập mã OTP</label>
              <input type="text" maxLength={6} required value={inputOtp} onChange={(e) => setInputOtp(e.target.value)} placeholder="------" className="w-full text-center tracking-[0.5em] text-lg font-mono py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <p className="text-center text-xs text-slate-500">Hiệu lực trong: <span className="text-cyan-400 font-mono">{otpTimer}s</span></p>
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold rounded-xl text-sm">
              Xác nhận & Hoàn tất
            </button>
          </form>
        )}
      </div>
    </div>
  );
}