import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiGrid, 
  FiDatabase, 
  FiSearch, 
  FiCamera, 
  FiPackage, 
  FiSettings,
  FiTerminal
} from 'react-icons/fi';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FiGrid },
    { name: 'Natural Language SQL', path: '/sql', icon: FiDatabase },
    { name: 'Product Search', path: '/search', icon: FiSearch },
    { name: 'Image Search', path: '/image-search', icon: FiCamera },
    { name: 'Finished Goods', path: '/products', icon: FiPackage },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Upper Section */}
      <div>
        {/* Logo Branding */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-md">
              <FiTerminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide text-sm block">AI ERP</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest block -mt-0.5">apparel platform</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-4 space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-zinc-900 text-white border border-zinc-800'
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white border border-transparent'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`} />
                    <span>{item.name}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
        <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-zinc-900/40 transition-colors">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
              alt="User profile avatar"
              className="w-10 h-10 rounded-full border border-zinc-800 object-cover"
            />
            <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-zinc-950"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate">Ashish Mishra</h4>
            <p className="text-[10px] text-zinc-500 truncate">ashish.mishra@wfx.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
