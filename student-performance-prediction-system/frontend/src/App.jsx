import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import PredictPerformance from './pages/PredictPerformance';
import UploadCSV from './pages/UploadCSV';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import ModelInsights from './pages/ModelInsights';
import Reports from './pages/Reports';
import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [predictPrefill, setPredictPrefill] = useState(null);
  const [notification, setNotification] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  const showNotification = (type, message, title) => {
    setNotification({ type, message, title });
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await api.getHealth();
        setSystemHealth(health);
      } catch (err) {
        console.warn('Backend not responding yet:', err);
      }
    };
    checkHealth();
  }, []);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            setActivePage={setActivePage}
            setPredictPrefill={setPredictPrefill}
            showNotification={showNotification}
          />
        );
      case 'students':
        return (
          <StudentManagement
            setActivePage={setActivePage}
            setPredictPrefill={setPredictPrefill}
            showNotification={showNotification}
          />
        );
      case 'predict':
        return (
          <PredictPerformance
            predictPrefill={predictPrefill}
            showNotification={showNotification}
          />
        );
      case 'upload':
        return (
          <UploadCSV
            showNotification={showNotification}
          />
        );
      case 'analytics':
        return (
          <PerformanceAnalytics
            setActivePage={setActivePage}
            setPredictPrefill={setPredictPrefill}
            showNotification={showNotification}
          />
        );
      case 'model':
        return (
          <ModelInsights
            showNotification={showNotification}
          />
        );
      case 'reports':
        return (
          <Reports
            showNotification={showNotification}
          />
        );
      default:
        return (
          <Dashboard
            setActivePage={setActivePage}
            setPredictPrefill={setPredictPrefill}
            showNotification={showNotification}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          setIsMobileOpen={setIsMobileOpen}
          systemHealth={systemHealth}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Toast Notification Container */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

