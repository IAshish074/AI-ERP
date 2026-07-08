import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar backdrop overlay (mobile only) */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden cursor-pointer"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Viewport Render Outlet */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
