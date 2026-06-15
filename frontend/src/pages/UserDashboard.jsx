import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LogOut, Clock, Activity, CreditCard, History, Upload, X, CheckCircle, Clock3, XCircle, Crown, FileText, ChevronRight, Sun, Moon } from 'lucide-react';

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [historyData, setHistoryData] = useState({ attendance: [], payments: [] });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', utrNumber: '', screenshot: null });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('userToken');

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

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('https://library-backend-1fhf.onrender.com/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      toast.error('Session expired. Please log in again.');
      navigate('/user-login');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('https://library-backend-1fhf.onrender.com/api/user/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryData(res.data);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.screenshot) return toast.error("Please select a screenshot.");

    setSubmittingPayment(true);
    const formData = new FormData();
    formData.append('amount', paymentForm.amount);
    formData.append('utrNumber', paymentForm.utrNumber);
    formData.append('screenshot', paymentForm.screenshot);

    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/user/payments', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Payment proof submitted for verification!");
      setShowPaymentModal(false);
      setPaymentForm({ amount: '', utrNumber: '', screenshot: null });
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    toast.loading('Verifying library proximity...', { id: 'gps' });
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        await axios.post('https://library-backend-1fhf.onrender.com/api/user/attendance/check-in', 
          { latitude, longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Successfully checked in! Have a great session.', { id: 'gps' });
        fetchProfile();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to check in', { id: 'gps' });
      }
    }, async (error) => {
      if (error.code === 2) {
        toast.loading("GPS weak. Using network location...", { id: 'gps' });
        try {
          const ipRes = await axios.get('https://ipapi.co/json/');
          await axios.post('https://library-backend-1fhf.onrender.com/api/user/attendance/check-in', 
            { latitude: ipRes.data.latitude, longitude: ipRes.data.longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Checked in via network location.', { id: 'gps' });
          fetchProfile();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Verification failed', { id: 'gps' });
        }
        return;
      }
      toast.error("Unable to retrieve location.", { id: 'gps' });
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const handleCheckOut = async () => {
    const loadingToast = toast.loading('Logging check out...');
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/user/attendance/check-out', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Checked out successfully. See you next time!', { id: loadingToast });
      fetchProfile();
      fetchHistory();
    } catch (err) {
      toast.error('Failed to check out', { id: loadingToast });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/user-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, attendance } = profile;
  const isCheckedIn = attendance && attendance.status === 'checked_in';
  const isExpired = new Date(user.subscriptionEndDate) < new Date();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 font-sans pb-12 transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-tight">{user.name.split(' ')[0]}</h1>
            <div className="flex items-center gap-1 text-[10px]">
              {user.isPremium ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center">
                  <Crown size={10} className="mr-0.5" /> Premium
                </span>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Standard</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6 relative z-20">
        
        {/* iOS segmented control for tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'dashboard' ? 'bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <Activity size={16} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <History size={16} /> History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dash"
              variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Main Action Card */}
              <motion.div variants={itemVariants} className="pro-card p-8 text-center relative overflow-hidden">
                {isCheckedIn && <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />}
                
                <div className="relative">
                  <motion.div 
                    animate={isCheckedIn ? { scale: [1, 1.05, 1] } : {}} 
                    transition={{ repeat: isCheckedIn ? Infinity : 0, duration: 2 }}
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ring-4 ring-offset-4 dark:ring-offset-[#121214] ${isCheckedIn ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-500/20' : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 ring-zinc-50 dark:ring-zinc-800/50'}`}
                  >
                    <Clock size={40} strokeWidth={1.5} />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                    {isCheckedIn ? 'Session Active' : 'Ready to study?'}
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
                    {isCheckedIn 
                      ? `You checked in at ${new Date(attendance.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.` 
                      : 'Check in to start tracking your reading hours.'}
                  </p>

                  {isCheckedIn ? (
                    <button 
                      onClick={handleCheckOut}
                      className="premium-button w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-base shadow-md"
                    >
                      End Session
                    </button>
                  ) : (
                    <button 
                      onClick={handleCheckIn}
                      disabled={isExpired}
                      className="premium-button w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-base shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
                    >
                      <MapPin size={18} />
                      {isExpired ? 'Subscription Expired' : 'Check In Now'}
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Status & Payment Card */}
              <motion.div variants={itemVariants} className="pro-card p-5">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2"><CreditCard size={16}/> Membership Status</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider mb-1">Valid Until</p>
                      <p className={`text-sm font-semibold ${isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {new Date(user.subscriptionEndDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    {isExpired ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="premium-button w-full py-3 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex justify-center items-center gap-2 text-sm"
                  >
                    <Upload size={16} /> Upload Payment Proof
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="hist"
              variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              {/* Attendance History */}
              <div className="pro-card overflow-hidden">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <Activity size={16} className="text-zinc-500 dark:text-zinc-400" />
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Recent Sessions</h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 max-h-[300px] overflow-y-auto">
                  {historyData.attendance.length === 0 ? (
                    <p className="p-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">No recent sessions.</p>
                  ) : (
                    historyData.attendance.slice(0, 10).map((record) => (
                      <motion.div variants={itemVariants} key={record._id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                            <span>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}</span>
                            <ChevronRight size={12} className="text-zinc-300 dark:text-zinc-600" />
                            <span>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-500/20">
                            {record.totalMinutes} min
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment History */}
              <div className="pro-card overflow-hidden">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <CreditCard size={16} className="text-zinc-500 dark:text-zinc-400" />
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Payment History</h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {historyData.payments.length === 0 ? (
                    <p className="p-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">No payment records found.</p>
                  ) : (
                    historyData.payments.map((payment) => (
                      <motion.div variants={itemVariants} key={payment._id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">₹{payment.amount}</span>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">Ref: {payment.utrNumber}</p>
                          </div>
                          <div>
                            {payment.status === 'verified' && <span className="flex items-center text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded"><CheckCircle size={10} className="mr-1"/> Verified</span>}
                            {payment.status === 'pending' && <span className="flex items-center text-amber-700 dark:text-amber-400 text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded"><Clock3 size={10} className="mr-1"/> Pending</span>}
                            {payment.status === 'rejected' && <span className="flex items-center text-rose-700 dark:text-rose-400 text-[10px] font-semibold bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded"><XCircle size={10} className="mr-1"/> Rejected</span>}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-50 dark:border-zinc-800/50">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{new Date(payment.createdAt).toLocaleDateString()}</span>
                          {payment.screenshotUrl && (
                            <button onClick={() => setSelectedImage(`https://library-backend-1fhf.onrender.com${payment.screenshotUrl}`)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-medium flex items-center gap-1">
                              <FileText size={12} /> View Receipt
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Proof Upload Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowPaymentModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#121214] rounded-t-[2rem] sm:rounded-2xl sm:w-full sm:max-w-md shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[90vh] flex flex-col"
            >
              <div className="p-4 flex justify-center sm:hidden bg-white dark:bg-[#121214] border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
              </div>
              <div className="px-5 py-4 flex justify-between items-center shrink-0 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Upload Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-4">
                {profile.config?.upiId && (
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 mb-2">
                    <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Pay to this UPI ID</p>
                    <p className="text-base font-bold text-indigo-900 dark:text-indigo-300 font-mono tracking-tight">{profile.config.upiId}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Amount Paid</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 font-semibold">₹</span>
                    <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="premium-input pl-7" placeholder="0.00" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">12-Digit UTR No.</label>
                  <input type="text" value={paymentForm.utrNumber} onChange={e => setPaymentForm({...paymentForm, utrNumber: e.target.value})} className="premium-input font-mono text-xs" placeholder="e.g. 312345678901" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Screenshot</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-200 dark:border-zinc-700 border-dashed rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-zinc-50 dark:bg-zinc-800/30 group relative">
                    <div className="space-y-2 text-center">
                      <div className="w-10 h-10 bg-white dark:bg-[#121214] rounded shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                        <Upload className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div className="flex text-sm text-zinc-600 dark:text-zinc-400 justify-center">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                          <span>Click to browse</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={e => setPaymentForm({...paymentForm, screenshot: e.target.files[0]})} />
                        </label>
                      </div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500">PNG, JPG up to 5MB</p>
                      {paymentForm.screenshot && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-500/10 py-1 px-2 rounded inline-block border border-emerald-100 dark:border-emerald-500/20">{paymentForm.screenshot.name}</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-2 pb-4">
                  <button type="submit" onClick={handlePaymentSubmit} disabled={submittingPayment} className="premium-button w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 py-3 shadow-md disabled:opacity-50 text-sm">
                    {submittingPayment ? 'Uploading Proof...' : 'Submit for Verification'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4" 
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-6 right-6 p-2 bg-white/10 text-white hover:bg-white/20 rounded border border-white/10 transition-colors">
              <X size={18} />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              src={selectedImage} alt="Receipt" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10 shadow-2xl" 
              onClick={e => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}