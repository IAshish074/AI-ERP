import React from 'react';
import { FiMenu, FiBell, FiSearch, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext';

export const Navbar = ({ toggleSidebar }) => {
  const { statuses } = useSettings();

  // Find system status
  const isHealthy = Object.values(statuses).every(status => status === 'healthy' || status === 'unknown');

  return (
    <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center space-x-4 flex-1">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Global ERP search bar */}
        <div className="relative max-w-xs w-full hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search transactions, goods..."
            className="w-full bg-zinc-900/50 border border-zinc-900 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Side Icons & Actions */}
      <div className="flex items-center space-x-4">
        {/* Connection status tag */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-success' : 'bg-red-500 animate-pulse'}`}></span>
          <span>{isHealthy ? 'Connected to ERP Core' : 'API Node Offline'}</span>
        </div>

        {/* Notifications Bell */}
        <button
          type="button"
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white relative cursor-pointer"
        >
          <FiBell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-zinc-950"></span>
        </button>

        <div className="h-6 w-[1px] bg-zinc-900"></div>

        {/* User Mini Card */}
        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-white block">Ashish Mishra</span>
            <span className="text-[10px] text-zinc-550 block">System Administrator</span>
          </div>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
            alt="User profile avatar small"
            className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
