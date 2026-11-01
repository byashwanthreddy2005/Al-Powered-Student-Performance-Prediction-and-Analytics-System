import React from 'react';

export default function MetricCard({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  badgeText,
  badgeColor = 'cyan', // cyan, rose, emerald, amber, blue
  onClick
}) {
  const badgeStyles = {
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  };

  const iconColors = {
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-cyan-500/50 dark:hover:border-cyan-500/50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconColors[badgeColor] || iconColors.cyan}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800/80">
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </span>
        {badgeText && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

