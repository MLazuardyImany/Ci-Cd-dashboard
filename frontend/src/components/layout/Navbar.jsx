import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Folder, Settings, Terminal } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/projects', label: 'Projects', icon: Folder },
    { path: '/builds', label: 'Builds', icon: Terminal },
  ];
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-md flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white dark:text-black" />
            </div>
            <span className="text-gray-900 dark:text-white">CI/CD Dashboard</span>
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          {/* Right Side - Theme Toggle & Settings */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;