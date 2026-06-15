import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Users, CreditCard, Activity, Star, AlertCircle, TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, pendingPayments: 0, activeNow: 0, premiumUsers: 0, expiredUsers: 0 });
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://library-backend-1fhf.onrender.com/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allUsers = res.data.users || [];
        
        setStats({
          totalUsers: allUsers.length,
          pendingPayments: allUsers.filter(u => u.status === 'pending_payment').length,
          activeNow: allUsers.filter(u => u.isPresent).length,
          premiumUsers: allUsers.filter(u => u.isPremium).length,
          expiredUsers: allUsers.filter(u => new Date(u.subscriptionEndDate) < new Date()).length
        });
      } catch (error) {
        toast.error("Failed to load dashboard data");
      }
    };
    
    fetchData();

    const libraryId = localStorage.getItem('libraryId');
    const socket = io('https://library-backend-1fhf.onrender.com');
    if (libraryId) socket.on(`attendanceUpdate_${libraryId}`, fetchData);

    return () => socket.disconnect();
  }, [token]);

  const metrics = [
    { title: 'Total Members', value: stats.totalUsers, icon: Users, trend: '+12%', isUp: true },
    { title: 'Active Right Now', value: stats.activeNow, icon: Activity, trend: 'Peak', isUp: true },
    { title: 'Premium Subs', value: stats.premiumUsers, icon: Star, trend: '+4%', isUp: true },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard, trend: 'Action Req', isUp: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* Crisp Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Overview</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Real-time metrics and library activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/members')} className="premium-button bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs py-1.5">
            <Zap size={14} className="mr-1.5" /> Quick Add Member
          </button>
          <span className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live System Status
          </span>
        </div>
      </div>

      {/* Sharp Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            key={i} 
            className="pro-card p-5 flex flex-col justify-between h-32 hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{metric.title}</p>
              <metric.icon size={16} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{metric.value}</h3>
              <div className={`flex items-center gap-1 text-xs font-medium ${metric.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {metric.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {metric.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Heatmap Feature */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pro-card p-5 col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Weekly Busyness</h3>
            <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1">
              <Clock size={12} /> Last 7 Days
            </button>
          </div>
          
          <div className="flex items-end gap-2 h-40">
            {[40, 70, 45, 90, 65, 85, 30].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-2 group cursor-crosshair">
                <div className="w-full bg-indigo-500/10 dark:bg-indigo-500/20 rounded-sm relative transition-all group-hover:bg-indigo-500/30" style={{ height: `${height}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {height} Check-ins
                  </div>
                  <div className="absolute bottom-0 w-full bg-indigo-500 dark:bg-indigo-400 rounded-sm border-t border-indigo-400 dark:border-indigo-300" style={{ height: '4px' }} />
                </div>
                <div className="text-center text-[10px] text-zinc-400 font-medium uppercase">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Items List */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pro-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Attention Required</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {stats.expiredUsers > 0 && (
              <div onClick={() => navigate('/members')} className="flex items-start gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer group">
                <div className="mt-0.5 text-rose-500"><AlertCircle size={16} /></div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline">{stats.expiredUsers} Subscriptions Expired</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Automated reminders failed or ignored.</p>
                </div>
              </div>
            )}
            {stats.pendingPayments > 0 && (
              <div onClick={() => navigate('/payments')} className="flex items-start gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer group">
                <div className="mt-0.5 text-amber-500"><CreditCard size={16} /></div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline">{stats.pendingPayments} Pending Payments</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Requires manual verification of screenshots.</p>
                </div>
              </div>
            )}
            {stats.expiredUsers === 0 && stats.pendingPayments === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 dark:text-zinc-500">
                 <div className="w-10 h-10 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-2">🎉</div>
                 <p className="text-sm">Inbox Zero</p>
               </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}