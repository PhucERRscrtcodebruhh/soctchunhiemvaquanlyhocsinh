import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Award, Compass, ArrowRight, Users, UserPlus, FileText, ExternalLink, Terminal, Database } from 'lucide-react';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import { MODULE_REGISTRY } from './modules';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // State lớp học trung tâm
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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setClassState(prev => ({
      ...prev,
      teacherName: user.fullName,
      teacherPhone: user.phone,
      className: user.className,
      totalStudents: user.role === 'developer' ? prev.totalStudents : 0,
      studentsList: user.role === 'developer' ? prev.studentsList : [],
      emulationPoints: 100
    }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Nếu chưa đăng nhập -> Hiển thị Modal xác thực
  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} classTitle={classState.bookTitle} />;
  }

  // Tìm module tương ứng trong Cogs Registry
  const allModules = MODULE_REGISTRY.flatMap(p => p.modules);
  const currentModule = allModules.find(m => m.id === activeTab);
  const ActiveComponent = currentModule?.component;

  return (
    <div 
      className="min-h-screen text-slate-100 flex font-sans bg-cover bg-center bg-no-repeat bg-fixed relative overflow-x-hidden"
      style={{ backgroundImage: `url('./bg-khaigiang.jpg')` }}
    >
      {activeTab !== 'home' && <div className="fixed inset-0 bg-slate-950/80 pointer-events-none z-0" />}

      {/* Nút thu gọn / mở rộng [<] [>] */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? "Ẩn danh mục [<]" : "Mở danh mục [>]"}
        className={`fixed top-4 z-30 p-2 rounded-xl border border-slate-700 bg-slate-900/90 text-cyan-400 hover:bg-slate-800 transition-all duration-300 shadow-xl flex items-center gap-1.5 ${
          isSidebarOpen ? 'left-[296px]' : 'left-4'
        }`}
      >
        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className="text-[11px] font-mono font-bold pr-1">{isSidebarOpen ? '[<]' : '[>]'}</span>
      </button>

      {/* Sidebar điều hướng */}
      <Sidebar 
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        classNameInfo={classState.className}
      />

      {/* Main Viewport */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10">

        {/* 1. TRANG CHỦ (Ảnh trong suốt) */}
        {activeTab === 'home' && (
          <div className="max-w-5xl space-y-6 pt-12 md:pt-4">
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
                onClick={() => setActiveTab('dashboard')}
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
          <div className="max-w-5xl space-y-6 pt-12 md:pt-0">
            <header className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">{classState.schoolName}</span>
                <h1 className="text-xl font-bold text-white tracking-tight">{classState.bookTitle}</h1>
                <p className="text-xs text-slate-400 mt-1">Lớp: <b className="text-slate-200">{classState.className}</b> • GVCN: <b className="text-slate-200">{classState.teacherName}</b></p>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">Năm học 2026 - 2027</span>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400">SĨ SỐ HỌC SINH</span>
                <div className="text-2xl font-bold text-white mt-1">{classState.totalStudents} em</div>
                <div className="text-xs text-slate-500 mt-1">{classState.totalStudents === 0 ? 'Chưa có dữ liệu học sinh' : 'Đang cập nhật'}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400">ĐIỂM THI ĐUA GỐC</span>
                <div className="text-2xl font-bold text-white mt-1">{classState.emulationPoints} đ</div>
                <div className="text-xs text-amber-400/80 mt-1">Chuẩn nề nếp thi đua đầu tuần</div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white">Danh sách học sinh</h3>
                <button 
                  onClick={() => {
                    const name = prompt('Nhập họ tên học sinh:');
                    if (name?.trim()) {
                      setClassState(p => ({
                        ...p,
                        totalStudents: p.totalStudents + 1,
                        studentsList: [...p.studentsList, { id: Date.now(), name: name.trim() }]
                      }));
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
                <ul className="divide-y divide-slate-800 text-xs text-slate-300">
                  {classState.studentsList.map((st, i) => (
                    <li key={st.id} className="py-2 flex justify-between">
                      <span>{i + 1}. {st.name}</span>
                      <button 
                        onClick={() => setClassState(p => ({
                          ...p,
                          totalStudents: p.totalStudents - 1,
                          studentsList: p.studentsList.filter(s => s.id !== st.id)
                        }))} 
                        className="text-red-400 hover:underline"
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
          <div className="max-w-6xl space-y-4 pt-12 md:pt-0">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> Thông tư 22/2021/TT-BGDĐT
              </h2>
              <a href={REGULATION_URL} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-800 text-cyan-400 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700">
                Mở tab mới <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="w-full h-[750px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <iframe src={REGULATION_URL} title="Thông tư 22" className="w-full h-full border-0 bg-white" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
            </div>
          </div>
        )}

        {/* 4. RENDER CÁC COG MODULE (TỰ ĐỘNG KHỚP THEO REGISTRY) */}
        {ActiveComponent && <ActiveComponent classData={classState} />}

        {/* 5. DEV CONSOLE */}
        {activeTab === 'dev_panel' && currentUser.role === 'developer' && (
          <div className="max-w-5xl space-y-4 pt-12 md:pt-0">
            <header className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-center gap-3">
              <Terminal className="w-6 h-6 text-amber-400" />
              <div>
                <h1 className="text-base font-bold text-white">Developer Debug Console</h1>
                <p className="text-xs text-amber-400/80">Quản trị viên root: TRƯỜNG THPT PHÙ CỪ</p>
              </div>
            </header>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
              Mô hình Cogs Modular đã được nạp: <b className="text-cyan-400">{allModules.length} Modules</b> thuộc 3 Phân hệ chính.
            </div>
          </div>
        )}

      </main>
    </div>
  );
}