import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, ShieldCheck } from 'lucide-react';
import DbHealthBadge from './DbHealthBadge';

export default function DevConsole({ userProfile, theme = 'dark' }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Không lấy được logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const timer = setInterval(fetchLogs, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 font-mono shadow-2xl backdrop-blur-md">
      {/* Header Console */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-amber-400 text-sm">Developer Debug Console</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Node: {userProfile?.school || 'THPT Phù Cừ'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <DbHealthBadge theme={theme} />
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Làm mới log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Thông tin Operator */}
      <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span>Người vận hành:</span>
        <b className="text-white">{userProfile?.name || 'Quản trị viên root'}</b>
        <span className="text-slate-500">({userProfile?.email || 'dev@phucu.edu.vn'})</span>
      </div>

      {/* Bảng Log thời gian thực */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 max-h-56 overflow-y-auto space-y-1.5 text-xs">
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-4 italic">
            Chưa có giao dịch ghi nhận trong cơ sở dữ liệu. Thực hiện một thao tác lưu bất kỳ để theo dõi...
          </div>
        ) : (
          logs.map((item) => (
            <div key={item.id} className="flex items-start gap-2 hover:bg-slate-800/40 p-1 rounded transition">
              <span className="text-slate-500 text-[10px] whitespace-nowrap pt-0.5">
                {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold whitespace-nowrap">
                {item.action}
              </span>
              <span className="text-slate-300 break-all flex-1">
                {item.details}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}