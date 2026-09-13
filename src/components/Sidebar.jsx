import React from 'react';
import { Home, LayoutDashboard, FileText, Terminal, LogOut } from 'lucide-react';
import { MODULE_REGISTRY } from '../modules';

export default function Sidebar({ isOpen, activeTab, onSelectTab, currentUser, onLogout, classNameInfo }) {
  return (
    <aside 
      className={`w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full absolute'
      }`}
    >
      <div className="overflow-y-auto p-4 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <img src="./logo-phucu.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow" />
          <div className="overflow-hidden">
            <h2 className="font-bold text-xs text-white uppercase truncate">TRƯỜNG THPT PHÙ CỪ</h2>
            <span className="text-[10px] text-cyan-400 font-mono block">
              {currentUser.role === 'developer' ? 'Root Debug' : `Lớp: ${classNameInfo}`}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Menu hệ thống */}
          <div className="space-y-1">
            <p className="px-2.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase">ĐIỀU HÀNH & QUY ĐỊNH</p>
            <button
              onClick={() => onSelectTab('home')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'home' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" /> <span>Trang chủ</span>
            </button>
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> <span>Bàn làm việc tổng quan</span>
            </button>
            <button
              onClick={() => onSelectTab('regulation')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'regulation' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" /> <span>Thông tư 22/2021/TT-BGDĐT</span>
            </button>
          </div>

          {/* Render 3 Phân hệ x 4 Logic từ MODULE_REGISTRY */}
          {MODULE_REGISTRY.map((pillar) => (
            <div key={pillar.pillarId} className="space-y-1">
              <p className="px-2.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase">{pillar.pillarTitle}</p>
              {pillar.modules.map(mod => {
                const isActive = activeTab === mod.id;
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectTab(mod.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{mod.title}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {currentUser.role === 'developer' && (
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <p className="px-2.5 text-[10px] font-bold text-amber-500 tracking-wider uppercase">ADMIN DEBUG</p>
              <button
                onClick={() => onSelectTab('dev_panel')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeTab === 'dev_panel' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Dev Console</span>
              </button>
            </div>
          )}
        </div>
      </div>

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
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition text-xs font-semibold border border-red-500/20">
          <LogOut className="w-3.5 h-3.5" /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}