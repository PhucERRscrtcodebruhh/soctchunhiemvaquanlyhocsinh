import React from 'react';
import { Home, LayoutDashboard, FileText, Terminal, LogOut, Sun, Moon } from 'lucide-react';
import { MODULE_REGISTRY } from '../modules';

export default function Sidebar({ 
  isOpen, 
  activeTab, 
  onSelectTab, 
  currentUser, 
  onLogout, 
  classNameInfo,
  theme = 'dark',
  onToggleTheme 
}) {
  const isDark = theme === 'dark';

  return (
    <aside 
      className={`w-72 border-r flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 transition-all duration-300 select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full absolute'
      } ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800 text-slate-200' 
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'
      }`}
    >
      <div className="overflow-y-auto p-4 space-y-6">
        {/* LOGO TRƯỜNG & NÚT ĐỔI THEME NHANH */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src="./logo-phucu.png" 
              alt="Logo THPT Phù Cừ" 
              className="w-10 h-10 object-contain drop-shadow" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="overflow-hidden">
              <h2 className="font-bold text-xs uppercase truncate tracking-wide">TRƯỜNG THPT PHÙ CỪ</h2>
              <span className="text-[10px] text-cyan-500 font-mono block">
                {currentUser?.role === 'developer' ? 'Root Debug' : `Lớp: ${classNameInfo || '10A1'}`}
              </span>
            </div>
          </div>

          {/* Nút đổi theme ở Sidebar */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              type="button"
              title={isDark ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
              className={`p-1.5 rounded-lg border transition ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-300 text-cyan-600 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Menu hệ thống chính */}
          <div className="space-y-1">
            <p className="px-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              ĐIỀU HÀNH & QUY ĐỊNH
            </p>
            <button
              onClick={() => onSelectTab('home')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'home' 
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" /> <span>Trang chủ</span>
            </button>
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'dashboard' 
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> <span>Bàn làm việc tổng quan</span>
            </button>
            <button
              onClick={() => onSelectTab('regulation')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'regulation' 
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" /> <span>Thông tư 22/2021/TT-BGDĐT</span>
            </button>
          </div>

          {/* Render 3 Phân hệ x 4 Logic từ MODULE_REGISTRY */}
          {MODULE_REGISTRY.map((pillar) => (
            <div key={pillar.pillarId} className="space-y-1">
              <p className="px-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                {pillar.pillarTitle}
              </p>
              {pillar.modules.map(mod => {
                const isActive = activeTab === mod.id;
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectTab(mod.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isActive 
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{mod.title}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Dành cho Quản trị viên Developer */}
          {currentUser?.role === 'developer' && (
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="px-2.5 text-[10px] font-bold text-amber-600 dark:text-amber-500 tracking-wider uppercase">
                ADMIN DEBUG
              </p>
              <button
                onClick={() => onSelectTab('dev_panel')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'dev_panel' 
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>Dev Console</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER USER & LOGOUT */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
        <div className="flex items-center gap-2.5 mb-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 dark:bg-slate-800 border border-cyan-500/30 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
            {currentUser?.fullName ? currentUser.fullName[0].toUpperCase() : 'GV'}
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {currentUser?.fullName || 'Người dùng'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {currentUser?.email || 'gv@phucu.edu.vn'}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="w-full flex items-center justify-center gap-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition text-xs font-semibold border border-red-500/20"
        >
          <LogOut className="w-3.5 h-3.5" /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}