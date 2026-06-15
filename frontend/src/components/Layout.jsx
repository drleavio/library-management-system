import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, CreditCard, Settings as SettingsIcon, 
  LogOut, Bell, Search, Menu, X, BookOpen, Sun, Moon, Command
} from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Overview' },
    { path: '/members', icon: Users, label: 'Members' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
          <BookOpen size={16} className="text-white dark:text-zinc-900" />
        </div>
        <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">LibPro</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Menu</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
              }`}>
                <item.icon size={16} className={isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 z-20 transition-colors duration-300">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full relative">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-3 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-zinc-500 dark:text-zinc-400">
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-[#09090B] hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-md border border-transparent text-zinc-500 dark:text-zinc-400 transition-colors text-sm w-64"
            >
              <Search size={14} />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-300">
                <Command size={10} /> K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isCommandOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm z-50" onClick={() => setIsCommandOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-[#121214] rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden"
            >
              <div className="flex items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <Search size={18} className="text-zinc-400" />
                <input autoFocus type="text" placeholder="Type a command or search..." className="flex-1 bg-transparent border-none focus:outline-none px-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500" />
                <kbd className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 font-mono border border-zinc-200 dark:border-zinc-700">ESC</kbd>
              </div>
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Actions</div>
                <button onClick={() => { navigate('/members'); setIsCommandOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 transition-colors">
                  <Users size={16} className="text-zinc-400" /> Go to Members
                </button>
                <button onClick={() => { navigate('/payments'); setIsCommandOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 transition-colors">
                  <CreditCard size={16} className="text-zinc-400" /> Verify Payments
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}