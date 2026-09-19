import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DbHealthBadge({ theme = 'dark', className = '' }) {
  const [health, setHealth] = useState({
    status: 'checking', // 'connected' | 'disconnected' | 'checking'
    latency: null,
    error: null,
    timestamp: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth({
          status: data.status || 'connected',
          latency: data.latency ?? (Date.now() - start),
          error: null,
          timestamp: data.timestamp || new Date().toISOString()
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        setHealth({
          status: 'disconnected',
          latency: errData.latency ?? (Date.now() - start),
          error: errData.error || `HTTP ${res.status}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setHealth({
        status: 'disconnected',
        latency: Date.now() - start,
        error: err.message || 'Mất kết nối mạng hoặc máy chủ MySQL tắt',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 15000);
    return () => clearInterval(timer);
  }, []);

  const isDark = theme === 'dark';
  const isConnected = health.status === 'connected';
  const isCheckingState = health.status === 'checking';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-300 select-none shadow-sm ${
        isConnected
          ? isDark
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : isCheckingState
          ? isDark
            ? 'bg-slate-900 border-slate-700 text-slate-400'
            : 'bg-slate-100 border-slate-300 text-slate-600'
          : isDark
          ? 'bg-red-950/50 border-red-500/40 text-red-400'
          : 'bg-red-50 border-red-300 text-red-700'
      } ${className}`}
      title={
        isConnected
          ? `MySQL đang hoạt động tốt. Độ trễ: ${health.latency}ms (Cập nhật: ${new Date(health.timestamp).toLocaleTimeString('vi-VN')})`
          : `Lỗi kết nối MySQL: ${health.error || 'Không phản hồi'}`
      }
    >
      {/* Đèn báo trạng thái */}
      <div className="relative flex items-center justify-center w-2.5 h-2.5">
        {isConnected ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </>
        ) : isCheckingState ? (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400 animate-pulse"></span>
        ) : (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </>
        )}
      </div>

      <Database className="w-3.5 h-3.5 shrink-0 opacity-80" />

      {/* Thông tin văn bản */}
      <div className="flex items-center gap-1.5">
        <span className="font-semibold">
          {isConnected ? 'MySQL' : isCheckingState ? 'Kiểm tra...' : 'MySQL Lỗi'}
        </span>
        {isConnected && health.latency !== null && (
          <span className="text-[11px] opacity-90 font-bold">
            {health.latency}ms
          </span>
        )}
      </div>

      {/* Nút check lại nhanh */}
      <button
        onClick={checkHealth}
        disabled={isChecking}
        className="ml-1 p-0.5 hover:opacity-100 opacity-60 hover:bg-black/10 dark:hover:bg-white/10 rounded transition"
        title="Kiểm tra lại kết nối MySQL"
      >
        <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
