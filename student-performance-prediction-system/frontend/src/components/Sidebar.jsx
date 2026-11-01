import React from 'react';
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  UploadCloud,
  LineChart,
  Cpu,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'predict', label: 'Predict Performance', icon: BrainCircuit, highlight: true },
    { id: 'upload', label: 'Upload CSV', icon: UploadCloud },
    { id: 'analytics', label: 'Performance Analytics', icon: LineChart },
    { id: 'model', label: 'Model Insights', icon: Cpu },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-navy-900 text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-navy-800 shadow-2xl lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                EduPredict <span className="text-cyan-400 font-extrabold text-sm uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">AI</span>
              </h1>
              <p className="text-[11px] text-slate-400 tracking-wider font-medium">
                Student Analytics System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-l-4 border-cyan-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* System Footer Badge */}
        <div className="p-4 m-4 rounded-xl bg-navy-950/70 border border-navy-800/80">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">ML Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Trained regression pipeline with cross-validation & risk analytics.
          </p>
        </div>
      </aside>
    </>
  );
}

