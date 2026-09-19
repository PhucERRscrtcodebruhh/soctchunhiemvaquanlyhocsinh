import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, BookOpen, Award, Compass, 
  ArrowRight, UserPlus, FileText, ExternalLink, Terminal, 
  RefreshCw, Database 
} from 'lucide-react';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import DbHealthBadge from './components/DbHealthBadge';
import { MODULE_REGISTRY } from './modules';

export default function App() {
  // 1. Quản lý Theme ('light' | 'dark') bền vững
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('sotay_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('sotay_theme', theme);
    } catch (e) {
      console.error('Lỗi thiết lập theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Quản lý User đăng nhập bền vững
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sotay_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. Quản lý Tab đang mở bền vững
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('sotay_tab') || 'home';
    } catch {
      return 'home';
    }
  });

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('sotay_tab', tab);
    } catch (e) {
      console.error('Lỗi lưu tab:', e);
    }
  };

  // 4. Quản lý trạng thái mở rộng / thu gọn Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem('sotay_sidebar_open') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sotay_sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

  // 5. State log hệ thống thật từ MySQL
  const [systemLogs, setSystemLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 6. State lớp học trung tâm
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

  // Hàm tải danh sách học sinh thật từ MySQL (/api/to-hocsinh) để đồng bộ sĩ số
  const syncStudentsFromDb = async () => {
    try {
      const res = await fetch('/api/to-hocsinh');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setClassState(prev => ({
            ...prev,
            totalStudents: data.length,
            studentsList: data.map(st => ({
              id: st.id,
              name: st.ho_ten,
              to_so: st.to_so,
              chuc_vu: st.chuc_vu_to
            }))
          }));
        }
      }
    } catch (e) {
      console.error('Không thể đồng bộ học sinh từ MySQL:', e);
    }
  };

  // Đồng bộ thông tin giáo viên và học sinh khi user đã đăng nhập
  useEffect(() => {
    if (currentUser) {
      setClassState(prev => ({
        ...prev,
        teacherName: currentUser.fullName || 'Giáo viên Chủ Nhiệm',
        teacherPhone: currentUser.phone || '',
        className: currentUser.className || '10A1'
      }));
      syncStudentsFromDb();
    }
  }, [currentUser]);

  // Hàm tải logs từ MySQL khi ở Dev Console
  const fetchSystemLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Không thể tải log hệ thống:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dev_panel') {
      fetchSystemLogs();
      const interval = setInterval(fetchSystemLogs, 8000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('sotay_user', JSON.stringify(user));
    } catch (e) {
      console.error('Lỗi lưu user session:', e);
    }
    setClassState(prev => ({
      ...prev,
      teacherName: user.fullName,
      teacherPhone: user.phone,
      className: user.className
    }));
    syncStudentsFromDb();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sotay_user');
      localStorage.removeItem('sotay_tab');
    } catch (e) {
      console.error('Lỗi xoá session:', e);
    }
    setActiveTab('home');
  };

  // Nếu chưa đăng nhập -> Hiển thị Modal xác thực
  if (!currentUser) {
    return (
      <AuthModal 
        onLoginSuccess={handleLoginSuccess} 
        classTitle={classState.bookTitle} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Tìm module tương ứng trong Cogs Registry
  const allModules = MODULE_REGISTRY.flatMap(p => p.modules);
  const currentModule = allModules.find(m => m.id === activeTab);
  const ActiveComponent = currentModule?.component;

  const isDark = theme === 'dark';

  return (
    <div 
      className="min-h-screen text-slate-100 flex font-sans bg-cover bg-center bg-no-repeat bg-fixed relative overflow-x-hidden transition-colors duration-300"
      style={{ backgroundImage: `url('./bg-khaigiang.jpg')` }}
    >
      {/* Lớp overlay phủ nền (Thích ứng Light / Dark qua class index.css) */}
      {activeTab !== 'home' && (
        <div className="fixed inset-0 bg-slate-950/80 pointer-events-none z-0 transition-colors duration-300" />
      )}

      {/* Sidebar điều hướng */}
      <Sidebar 
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        classNameInfo={classState.className}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto relative z-10">
        {/* TOP FLOATING HEADER TOOLBAR */}
        <header className="sticky top-0 z-30 px-6 py-3.5 backdrop-blur-md border-b transition-colors duration-300 flex items-center justify-between gap-4 bg-slate-950/40 border-white/10 dark:bg-slate-950/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            {/* Nút thu gọn / mở rộng Sidebar [<] [>] */}
            <button
              onClick={toggleSidebar}
              title={isSidebarOpen ? "Ẩn danh mục [<]" : "Mở danh mục [>]"}
              className="p-2 rounded-xl border border-slate-700/80 bg-slate-900/80 text-cyan-400 hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span className="text-[11px] font-mono font-bold pr-1">{isSidebarOpen ? '[<]' : '[>]'}</span>
            </button>

            <span className="text-xs font-semibold tracking-wide text-slate-200 truncate hidden sm:inline">
              Lớp <b className="text-cyan-400">{classState.className}</b> • {classState.schoolName}
            </span>
          </div>

          {/* Công cụ trạng thái MySQL và Đổi Theme */}
          <div className="flex items-center gap-2.5">
            <DbHealthBadge theme={theme} />
            <ThemeToggle theme={theme} onToggleTheme={toggleTheme} />
          </div>
        </header>

        {/* Nội dung chính */}
        <main className="flex-1 p-6 md:p-8">

          {/* 1. TRANG CHỦ (Ảnh trong suốt) */}
          {activeTab === 'home' && (
            <div className="max-w-5xl space-y-6">
              <header className="p-6 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px]">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest block mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {classState.schoolName}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {classState.bookTitle}
                </h1>
                <p className="text-sm text-slate-200 mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  Cổng thông tin điện tử lớp <b className="text-amber-300">{classState.className}</b> • GVCN: <b className="text-cyan-300">{classState.teacherName}</b>
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px]">
                  <div className="flex items-center justify-between text-slate-200 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider drop-shadow">HỆ THỐNG SỔ</span>
                    <BookOpen className="w-5 h-5 text-cyan-300 drop-shadow" />
                  </div>
                  <div className="text-lg font-bold text-white drop-shadow">Chủ Nhiệm Điện Tử</div>
                  <p className="text-xs text-slate-300 mt-1 drop-shadow">3 Phân hệ chuẩn hoá: Tổ chức - Nề nếp - Đánh giá</p>
                </div>

                <div className="p-5 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px]">
                  <div className="flex items-center justify-between text-slate-200 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider drop-shadow">ĐÁNH GIÁ THPT</span>
                    <Award className="w-5 h-5 text-amber-300 drop-shadow" />
                  </div>
                  <div className="text-lg font-bold text-white drop-shadow">Thông Tư 22/2021</div>
                  <p className="text-xs text-slate-300 mt-1 drop-shadow">Quy chuẩn đánh giá học lực & hạnh kiểm</p>
                </div>

                <div className="p-5 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px]">
                  <div className="flex items-center justify-between text-slate-200 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider drop-shadow">NĂM HỌC HIỆN TẠI</span>
                    <Compass className="w-5 h-5 text-emerald-300 drop-shadow" />
                  </div>
                  <div className="text-lg font-bold text-white drop-shadow">2026 - 2027</div>
                  <p className="text-xs text-slate-300 mt-1 drop-shadow">Đồng bộ hồ sơ lớp học trực tuyến</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-transparent border border-white/20 backdrop-blur-[2px] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white drop-shadow">Bắt đầu phiên làm việc</h3>
                  <p className="text-xs text-slate-300 mt-0.5 drop-shadow">Mở bàn làm việc để cập nhật danh sách học sinh</p>
                </div>
                <button
                  onClick={() => handleSelectTab('dashboard')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg"
                >
                  <span>Mở Bàn làm việc</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. BÀN LÀM VIỆC TỔNG QUAN */}
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl space-y-6">
              <header className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">{classState.schoolName}</span>
                  <h1 className="text-xl font-bold text-white tracking-tight">{classState.bookTitle}</h1>
                  <p className="text-xs text-slate-400 mt-1">Lớp: <b className="text-slate-200">{classState.className}</b> • GVCN: <b className="text-slate-200">{classState.teacherName}</b></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">Năm học 2026 - 2027</span>
                  <button
                    onClick={syncStudentsFromDb}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
                    title="Đồng bộ danh sách học sinh từ MySQL"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-400">SĨ SỐ HỌC SINH (MYSQL)</span>
                  <div className="text-2xl font-bold text-white mt-1">{classState.totalStudents} em</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {classState.totalStudents === 0 ? 'Chưa có dữ liệu học sinh' : 'Đã kết nối cơ sở dữ liệu MySQL'}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-400">ĐIỂM THI ĐUA GỐC</span>
                  <div className="text-2xl font-bold text-white mt-1">{classState.emulationPoints} đ</div>
                  <div className="text-xs text-amber-400/80 mt-1">Chuẩn nề nếp thi đua đầu tuần</div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white">Danh sách học sinh lớp {classState.className}</h3>
                  <button 
                    onClick={async () => {
                      const name = prompt('Nhập họ tên học sinh mới:');
                      if (name?.trim()) {
                        try {
                          const res = await fetch('/api/to-hocsinh', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              to_so: 1,
                              ho_ten: name.trim(),
                              chuc_vu_to: 'Thành viên',
                              ghi_chu: ''
                            })
                          });
                          if (res.ok) {
                            syncStudentsFromDb();
                          }
                        } catch (e) {
                          alert('Lỗi lưu học sinh vào MySQL: ' + e.message);
                        }
                      }
                    }}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Thêm học sinh
                  </button>
                </div>
                {classState.studentsList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">Chưa có học sinh trong danh sách.</p>
                ) : (
                  <ul className="divide-y divide-slate-800 text-xs text-slate-300 max-h-72 overflow-y-auto pr-1">
                    {classState.studentsList.map((st, i) => (
                      <li key={st.id} className="py-2.5 flex justify-between items-center">
                        <span>
                          <b>{i + 1}.</b> {st.name} 
                          {st.to_so && <span className="ml-2 text-slate-500">(Tổ {st.to_so})</span>}
                        </span>
                        <button 
                          onClick={async () => {
                            if (!window.confirm(`Xóa học sinh ${st.name}?`)) return;
                            try {
                              const res = await fetch(`/api/to-hocsinh/${st.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                syncStudentsFromDb();
                              }
                            } catch (e) {
                              alert('Lỗi xóa học sinh: ' + e.message);
                            }
                          }} 
                          className="text-red-400 hover:underline px-2 py-1 text-[11px]"
                        >
                          Xoá
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 3. THÔNG TƯ 22 IFRAME */}
          {activeTab === 'regulation' && (
            <div className="max-w-6xl space-y-4">
              <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Thông tư 22/2021/TT-BGDĐT
                </h2>
                <a 
                  href={REGULATION_URL} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-3 py-1.5 bg-slate-800 text-cyan-400 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  Mở tab mới <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="w-full h-[750px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <iframe 
                  src={REGULATION_URL} 
                  title="Thông tư 22" 
                  className="w-full h-full border-0 bg-white" 
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms" 
                />
              </div>
            </div>
          )}

          {/* 4. RENDER CÁC COG MODULE (TỰ ĐỘNG KHỚP THEO REGISTRY) */}
          {ActiveComponent && <ActiveComponent classData={classState} />}

          {/* 5. DEV CONSOLE (Hiển thị thông số Cogs + Logs thật từ MySQL) */}
          {activeTab === 'dev_panel' && currentUser.role === 'developer' && (
            <div className="max-w-5xl space-y-4">
              <header className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-amber-400" />
                  <div>
                    <h1 className="text-base font-bold text-white">Developer Debug Console</h1>
                    <p className="text-xs text-amber-400/80">Quản trị viên root: TRƯỜNG THPT PHÙ CỪ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DbHealthBadge theme={theme} />
                  <button
                    onClick={fetchSystemLogs}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition"
                    title="Tải lại logs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </header>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                Mô hình Cogs Modular đã được nạp: <b className="text-cyan-400">{allModules.length} Modules</b> thuộc 3 Phân hệ chính.
              </div>

              {/* BẢNG LOGS THẬT TỪ DATABASE */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 font-mono">
                <div className="text-xs text-slate-400 mb-2 font-bold flex items-center gap-2">
                  <span>Lịch sử truy vấn dữ liệu thời gian thực (tbl_system_logs):</span>
                </div>
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 max-h-64 overflow-y-auto space-y-2 text-xs">
                  {systemLogs.length === 0 ? (
                    <div className="text-slate-600 text-center py-4 italic">
                      Chưa có giao dịch ghi nhận trong cơ sở dữ liệu.
                    </div>
                  ) : (
                    systemLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/60 p-1 rounded transition">
                        <span className="text-slate-500 text-[10px] pt-0.5 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold whitespace-nowrap">
                          {log.action}
                        </span>
                        <span className="text-slate-300 break-all flex-1">
                          {log.details}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}