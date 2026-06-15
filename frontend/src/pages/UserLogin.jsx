import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowRight, User, Sun, Moon, Library } from 'lucide-react';

export default function UserLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Initialize Theme
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://library-backend-1fhf.onrender.com/api/user/login', { phone });
      localStorage.setItem('userToken', res.data.token);
      toast.success('Identity verified.');
      navigate('/user-dashboard');
    } catch (err) {
      toast.error('Record not found. Check ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B] transition-colors duration-300 relative px-4 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-20">
        <button 
          onClick={toggleTheme} 
          className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent dark:border-zinc-700"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm mb-5">
            <Library size={28} className="text-zinc-900 dark:text-zinc-100" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-1.5">
            Member Portal
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Sign in to manage your library sessions
          </p>
        </div>

        {/* Clean, readable Card */}
        <div className="bg-white dark:bg-[#121214] p-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl transition-colors duration-300">
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                Registered Mobile
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-400 dark:text-zinc-500">
                  <User size={16} />
                </div>
                {/* Standard, highly readable input */}
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-400 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium rounded-xl hover:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Run Authentication <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/login" className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 text-sm font-medium transition-colors border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 pb-0.5">
            Switch to Admin Interface
          </Link>
        </div>
      </motion.div>
    </div>
  );
}