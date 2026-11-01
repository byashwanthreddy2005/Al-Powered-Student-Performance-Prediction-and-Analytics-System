import React from 'react';
import { Menu, Sun, Moon, Sparkles, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activePage, setActivePage, setIsMobileOpen, systemHealth }) {
  const { darkMode, toggleDarkMode } = useTheme();

  const pageTitles = {
    dashboard: { title: 'Executive Analytics Dashboard', desc: 'Real-time student performance indicators and cohort insights' },
    students: { title: 'Student Management Directory', desc: 'Maintain student academic records, filter cohorts, and trigger ML predictions' },
    predict: { title: 'Single Student Performance Predictor', desc: 'Instant AI evaluation of examination marks with personalized recommendations' },
    upload: { title: 'Bulk CSV Batch Prediction', desc: 'Upload multiple student records for automated batch inference and analysis' },
    analytics: { title: 'Academic Performance Analytics', desc: 'In-depth correlation matrices, study hour dynamics, and at-risk student rosters' },
    model: { title: 'Machine Learning Model Insights', desc: 'Pipeline architecture, feature importance, and 5-fold cross-validation metrics' },
    reports: { title: 'Academic Reports & Export Center', desc: 'Download comprehensive institutional summaries and risk intervention rosters' },
  };

  const current = pageTitles[activePage] || { title: 'EduPredict AI', desc: 'Analytics Portal' };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 transition-colors">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side: Mobile Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white tracking-tight">
              {current.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Right Side: Health Status + Quick Actions + Dark Mode */}
        <div className="flex items-center gap-3">
          {/* Health Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Backend Connected
            </span>
            {systemHealth?.model_version && (
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold pl-1 border-l border-slate-300 dark:border-navy-700">
                {systemHealth.model_version}
              </span>
            )}
          </div>

          {/* Quick Predict Action */}
          {activePage !== 'predict' && (
            <button
              onClick={() => setActivePage('predict')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 hover:brightness-105 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Predict Score</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 transition-colors border border-slate-200 dark:border-navy-800"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-navy-800" />}
          </button>
        </div>
      </div>
    </header>
  );
}

