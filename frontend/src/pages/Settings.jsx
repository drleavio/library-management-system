import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MapPin, QrCode, MessageCircle, LogOut, Save, RefreshCw, Smartphone } from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState({ latitude: '', longitude: '', radiusMeters: 50, upiId: '' });
  const [whatsappStatus, setWhatsappStatus] = useState({ ready: false, qr: '', initialized: false });
  const [connecting, setConnecting] = useState(false);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('https://library-backend-1fhf.onrender.com/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.config) setConfig(res.data.config);
      } catch (error) {
        toast.error("Failed to fetch configuration");
      }
    };
    fetchConfig();
  }, [token]);

  useEffect(() => {
    const fetchWhatsAppStatus = async () => {
      try {
        const res = await axios.get('https://library-backend-1fhf.onrender.com/api/admin/whatsapp/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWhatsappStatus(res.data);
      } catch (error) {
        console.error("Failed to fetch WhatsApp status");
      }
    };

    fetchWhatsAppStatus();
    const intervalId = setInterval(fetchWhatsAppStatus, 3000);
    return () => clearInterval(intervalId);
  }, [token]);

  const handleConnectWhatsApp = async () => {
    setConnecting(true);
    try {
      const res = await axios.post('https://library-backend-1fhf.onrender.com/api/admin/whatsapp/connect', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWhatsappStatus(res.data);
      toast.success('Generating QR Code...');
    } catch (err) {
      toast.error('Failed to initiate connection');
    } finally {
      setConnecting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const saveToast = toast.loading('Saving configurations...');
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/admin/config', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings updated successfully', { id: saveToast });
    } catch (err) {
      toast.error('Failed to save settings', { id: saveToast });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.loading("Acquiring GPS fix...", { id: "loc" });
    navigator.geolocation.getCurrentPosition((position) => {
      setConfig({
        ...config,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      toast.success("Precise location acquired", { id: "loc" });
    }, (error) => {
      if (error.code === 2) {
        toast.loading("Falling back to IP location...", { id: "loc" });
        axios.get('https://ipapi.co/json/')
          .then(res => {
            setConfig({ ...config, latitude: res.data.latitude, longitude: res.data.longitude });
            toast.success("Location acquired via IP.", { id: "loc" });
          })
          .catch(() => {
            toast.error("Location detection failed.", { id: "loc" });
          });
        return;
      }
      toast.error("Unable to retrieve location.", { id: "loc" });
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const handleWhatsAppLogout = async () => {
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/admin/whatsapp/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Disconnected. Generating new session...");
      setWhatsappStatus({ ready: false, qr: '' });
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Workspace Settings</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure integrations, geolocation, and payment defaults.</p>
      </div>
      
      <motion.form 
        variants={containerVariants} initial="hidden" animate="show"
        onSubmit={handleSave} 
        className="space-y-6"
      >
        {/* WhatsApp Automation Card */}
        <motion.div variants={itemVariants} className="pro-card overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-800/20">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
              <MessageCircle size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">WhatsApp Automation</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Enable automated attendance alerts and payment reminders.</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1 space-y-4">
                {whatsappStatus.ready ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium border border-emerald-200/50 dark:border-emerald-500/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Connected & Operational
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md">Your library is successfully paired with WhatsApp. Automated notifications are active.</p>
                    <button type="button" onClick={handleWhatsAppLogout} className="premium-button text-sm bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 mt-2">
                      <LogOut size={16} className="mr-2" /> Disconnect Session
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium border border-amber-200/50 dark:border-amber-500/20">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Connection Required
                    </div>
                    <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-none">
                      <li className="flex items-center gap-2"><Smartphone size={16} className="text-zinc-400" /> 1. Open WhatsApp on your device.</li>
                      <li className="flex items-center gap-2"><span className="w-4 text-center text-zinc-400">⋮</span> 2. Go to Settings &gt; Linked Devices.</li>
                      <li className="flex items-center gap-2"><QrCode size={16} className="text-zinc-400" /> 3. Tap "Link a Device" and scan the QR.</li>
                    </ul>
                  </div>
                )}
              </div>
              
              {!whatsappStatus.ready && (
                <div className="flex-shrink-0 bg-zinc-50 dark:bg-[#09090B] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center w-full md:w-56 min-h-[200px]">
                  {whatsappStatus.initialized ? (
                    whatsappStatus.qr ? (
                      <motion.img 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(whatsappStatus.qr)}&size=200x200`} 
                        alt="WhatsApp Pair QR" 
                        className="w-44 h-44 rounded-lg bg-white p-2 border border-zinc-200"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-zinc-400">
                        <RefreshCw size={24} className="animate-spin mb-3 text-indigo-500" />
                        <span className="text-xs font-medium">Generating secure code...</span>
                      </div>
                    )
                  ) : (
                    <button type="button" onClick={handleConnectWhatsApp} disabled={connecting} className="premium-button bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 w-full">
                      {connecting ? 'Initializing...' : 'Pair Device'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Geofencing Config */}
        <motion.div variants={itemVariants} className="pro-card overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                <MapPin size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Geofencing Rules</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Define the physical perimeter where members can check in.</p>
              </div>
            </div>
            <button type="button" onClick={handleGetLocation} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 transition-colors">
              Auto-detect
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Latitude</label>
              <input type="number" step="any" value={config.latitude} onChange={e => setConfig({...config, latitude: e.target.value})} className="premium-input bg-zinc-50/50 dark:bg-[#09090B]" required placeholder="e.g. 28.6139" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Longitude</label>
              <input type="number" step="any" value={config.longitude} onChange={e => setConfig({...config, longitude: e.target.value})} className="premium-input bg-zinc-50/50 dark:bg-[#09090B]" required placeholder="e.g. 77.2090" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Allowed Radius (m)</label>
              <div className="relative">
                <input type="number" value={config.radiusMeters} onChange={e => setConfig({...config, radiusMeters: e.target.value})} className="premium-input bg-zinc-50/50 dark:bg-[#09090B] pr-12" required />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">meters</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Configuration */}
        <motion.div variants={itemVariants} className="pro-card overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-800/20">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-500/20">
              <QrCode size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Payment Gateway</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure how users submit membership fees.</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="w-full md:w-1/2">
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Library UPI ID</label>
              <input type="text" value={config.upiId} onChange={e => setConfig({...config, upiId: e.target.value})} placeholder="e.g. yourlibrary@ybl" className="premium-input bg-zinc-50/50 dark:bg-[#09090B]" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">This ID is sent automatically during payment reminders.</p>
            </div>
          </div>
        </motion.div>

        {/* Global Action Bar */}
        <motion.div variants={itemVariants} className="pt-2 flex justify-end">
          <button type="submit" className="premium-button bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 px-6 py-2.5">
            <Save size={16} className="mr-2" /> Save Configuration
          </button>
        </motion.div>

      </motion.form>
    </div>
  );
}