import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
