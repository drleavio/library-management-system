import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight, ShieldCheck, Phone, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [libraryName, setLibraryName] = useState('');
  const [step, setStep] = useState(1);
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

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/admin/request-otp', { phone });
      toast.success('Access code sent successfully.');
      setStep(2);
    } catch (err) {
      toast.error('Failed to send code. Please verify the number.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await axios.post('https://library-backend-1fhf.onrender.com/api/admin/login', { phone, otp });
      } else {
        res = await axios.post('https://library-backend-1fhf.onrender.com/api/admin/signup', { phone, otp, name, libraryName });
      }
      localStorage.setItem('adminToken', res.data.token);
      if (res.data.libraryId) localStorage.setItem('libraryId', res.data.libraryId);
      if (res.data.library) localStorage.setItem('libraryId', res.data.library._id);
      
      toast.success(isLogin ? 'Authentication successful.' : 'Library workspace created.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid code provided.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* Left Branding Panel */}
      <div className="lg:w-[45%] bg-[#F7F7F8] dark:bg-[#121214] border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Very subtle dot grid for editorial retro feel */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        
        <div className="relative z-10 flex flex-col h-full justify-center">
          <div className="w-12 h-12 bg-white dark:bg-[#09090B] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex items-center justify-center mb-8">
            <BookOpen size={24} className="text-zinc-900 dark:text-zinc-100" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight leading-tight mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            The operating system for modern libraries.
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md leading-relaxed">
            Manage patrons, track physical attendance via geolocation, and automate subscription payments seamlessly.
          </p>
        </div>

        <div className="relative z-10 mt-12 lg:mt-0">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090B] px-3 py-1.5 rounded-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Systems Operational
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={toggleTheme} 
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent dark:border-zinc-700"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[420px]"
        >
          {/* Form Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Admin Portal</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Authenticate to access your workspace</p>
          </div>

          {/* Clean Editorial Card */}
          <div className="bg-white dark:bg-[#121214] p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
            
            {step === 1 && (
              <div className="flex p-1 bg-zinc-100 dark:bg-[#09090B] rounded-xl mb-8 border border-zinc-200 dark:border-zinc-800/50">
                <button 
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isLogin ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                  onClick={() => setIsLogin(true)}
                  type="button"
                >
                  Sign In
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${!isLogin ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                  onClick={() => setIsLogin(false)}
                  type="button"
                >
                  Register
                </button>
              </div>
            )}
            
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRequestOtp} 
                  className="space-y-5"
                >
                  {!isLogin && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Admin Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Name" className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-400 rounded-xl px-4 py-3 text-sm transition-all outline-none" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Library Name</label>
                        <input type="text" value={libraryName} onChange={(e) => setLibraryName(e.target.value)} placeholder="e.g. Central Library" className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-400 rounded-xl px-4 py-3 text-sm transition-all outline-none" required />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">WhatsApp Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-zinc-400 dark:text-zinc-500">
                        <Phone size={16} />
                      </div>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 xxxxx xxxxx" className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-400 rounded-xl pl-11 pr-4 py-3 text-sm transition-all outline-none" required />
                    </div>
                  </div>
                  
                  <button type="submit" disabled={loading} className="w-full mt-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl py-3 font-medium hover:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? 'Sending code...' : <>Continue <ArrowRight size={16} /></>}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <ShieldCheck size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Verify Identity</h3>
                    <p className="text-sm text-zinc-500 mt-1">We sent a secure code to {phone}</p>
                  </div>

                  <div>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      placeholder="• • • •" 
                      className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-400 rounded-xl px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] font-bold outline-none transition-all" 
                      required 
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white dark:bg-[#121214] text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl py-3 font-medium transition-all">
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl py-3 font-medium hover:scale-[0.98] transition-all disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Sign In'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}