import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Notification({ notification, onClose }) {
  useEffect(() => {
    if (notification?.autoClose !== false) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const { type = 'info', message, title } = notification;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/30 text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-500/30 text-rose-800 dark:text-rose-200',
      icon: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-500/30 text-amber-800 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-500/30 text-cyan-800 dark:text-cyan-200',
      icon: <Info className="w-5 h-5 text-cyan-500 flex-shrink-0" />,
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-up">
      <div className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${config.bg}`}>
        {config.icon}
        <div className="flex-1 text-sm">
          {title && <p className="font-semibold mb-0.5">{title}</p>}
          <p className="leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

