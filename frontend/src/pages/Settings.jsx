import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, QrCode, MessageCircle, LogOut, Loader2, CheckCircle } from 'lucide-react';

const SectionHeader = ({ icon: Icon, label, color }) => (
  <div className="flex items-center gap-3 pb-4 mb-6" style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: `${color}15`, color }}
    >
      <Icon size={18} />
    </div>
    <h3 className="font-bold text-base" style={{ color: "#1e1b4b" }}>{label}</h3>
  </div>
);

const InputField = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#94a3b8" }}>{label}</label>
    {children}
    {hint && <p className="text-xs mt-1.5" style={{ color: "#94a3b8" }}>{hint}</p>}
  </div>
);

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(124,58,237,0.2)",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#1e1b4b",
  background: "#fafafa",
  outline: "none",
};

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
        console.error("Failed to fetch config");
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    let intervalId;
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
    intervalId = setInterval(fetchWhatsAppStatus, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const handleConnectWhatsApp = async () => {
    setConnecting(true);
    try {
      const res = await axios.post('https://library-backend-1fhf.onrender.com/api/admin/whatsapp/connect', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWhatsappStatus(res.data);
      toast.success('WhatsApp connecting... QR code will appear shortly.');
    } catch (err) {
      toast.error('Failed to start WhatsApp connection');
    } finally {
      setConnecting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/admin/config', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    toast.loading("Fetching location...", { id: "loc" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setConfig({ ...config, latitude: position.coords.latitude, longitude: position.coords.longitude });
        toast.success("Location acquired", { id: "loc" });
      },
      (error) => {
        if (error.code === 2) {
          toast.loading("Trying IP fallback...", { id: "loc" });
          axios.get('https://ipapi.co/json/')
            .then(res => {
              setConfig({ ...config, latitude: res.data.latitude, longitude: res.data.longitude });
              toast.success("Location acquired via IP", { id: "loc" });
            })
            .catch(() => {
              toast.error("Could not get location.", { id: "loc" });
              setConfig({ ...config, latitude: 28.6139, longitude: 77.2090 });
            });
          return;
        }
        let msg = "Unable to retrieve location.";
        if (error.code === 1) msg = "Permission denied. Enable Location Services.";
        if (error.code === 3) msg = "Location request timed out.";
        toast.error(msg, { id: "loc" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleWhatsAppLogout = async () => {
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/admin/whatsapp/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Disconnected from WhatsApp.");
      setWhatsappStatus({ ready: false, qr: '' });
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  const handleWhatsAppReset = async () => {
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/admin/whatsapp/reset', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Restarting... Please refresh in 10 seconds.");
      setWhatsappStatus({ ready: false, qr: '' });
    } catch (err) {
      toast.error("Failed to reset");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#1e1b4b" }}>Settings</h1>
        <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>Configure WhatsApp automation, geofencing, and payment settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">

        {/* WhatsApp */}
        <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 2px 12px rgba(124,58,237,0.05)" }}>
          <SectionHeader icon={MessageCircle} label="WhatsApp Automation" color="#7c3aed" />
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Connect your WhatsApp account to send automated attendance reports and payment reminders.
          </p>

          <div
            className="rounded-2xl p-6 flex flex-col lg:flex-row gap-8 items-start lg:items-center"
            style={{ background: "rgba(248,247,255,0.8)", border: "1px solid rgba(124,58,237,0.1)" }}
          >
            <div className="flex-1 space-y-4">
              <p className="font-semibold text-sm" style={{ color: "#1e1b4b" }}>Connection Status</p>

              {whatsappStatus.ready ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "#dcfce7" }}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>Connected & Ready</span>
                  </div>
                  <p className="text-sm" style={{ color: "#64748b" }}>WhatsApp is connected and ready to send messages.</p>
                  <button
                    type="button"
                    onClick={handleWhatsAppLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)" }}
                  >
                    <LogOut size={15} /> Disconnect Number
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "#fef3c7" }}>
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-semibold" style={{ color: "#d97706" }}>Waiting for Scan</span>
                  </div>
                  <ol className="text-sm space-y-1 list-decimal pl-5" style={{ color: "#64748b" }}>
                    <li>Open WhatsApp on your phone</li>
                    <li>Go to Linked Devices</li>
                    <li>Tap "Link a Device"</li>
                    <li>Scan the QR code</li>
                  </ol>
                </div>
              )}
            </div>

            {!whatsappStatus.ready && (
              <div className="flex flex-col items-center gap-3">
                {whatsappStatus.initialized ? (
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-48 h-48 rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{ background: "white", border: "2px solid rgba(124,58,237,0.2)", boxShadow: "0 4px 20px rgba(124,58,237,0.1)" }}
                    >
                      {whatsappStatus.qr ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(whatsappStatus.qr)}&size=200x200`}
                          alt="WhatsApp QR"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2" style={{ color: "#94a3b8" }}>
                          <Loader2 size={24} className="animate-spin" />
                          <span className="text-xs">Generating QR...</span>
                        </div>
                      )}
                    </div>
                    {whatsappStatus.initialized && !whatsappStatus.qr && (
                      <button
                        type="button"
                        onClick={handleWhatsAppReset}
                        className="text-xs underline"
                        style={{ color: "#ef4444" }}
                      >
                        Force Reset
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectWhatsApp}
                    disabled={connecting}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", boxShadow: "0 4px 16px rgba(22,163,74,0.3)" }}
                  >
                    {connecting ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                    Connect WhatsApp
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Geofencing */}
        <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 2px 12px rgba(124,58,237,0.05)" }}>
          <SectionHeader icon={MapPin} label="Geofencing & Location" color="#2563eb" />
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Set your library coordinates so members can only check in when physically nearby.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <InputField label="Latitude">
              <input
                type="number"
                step="any"
                value={config.latitude}
                onChange={e => setConfig({ ...config, latitude: e.target.value })}
                style={inputStyle}
                required
              />
            </InputField>
            <InputField label="Longitude">
              <input
                type="number"
                step="any"
                value={config.longitude}
                onChange={e => setConfig({ ...config, longitude: e.target.value })}
                style={inputStyle}
                required
              />
            </InputField>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mb-6 transition-all"
            style={{ background: "linear-gradient(135deg,#2563eb,#06b6d4)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
          >
            <MapPin size={15} /> Use My Current Location
          </button>

          <InputField label="Allowed Radius (meters)" hint="Members must stay within this radius to check in.">
            <input
              type="number"
              value={config.radiusMeters}
              onChange={e => setConfig({ ...config, radiusMeters: e.target.value })}
              style={{ ...inputStyle, maxWidth: "240px" }}
              required
            />
          </InputField>
        </div>

        {/* Payment */}
        <div className="rounded-2xl p-6" style={{ background: "white", border: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 2px 12px rgba(124,58,237,0.05)" }}>
          <SectionHeader icon={QrCode} label="Payment Configuration" color="#d97706" />
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            The UPI ID members will use to submit their subscription payments.
          </p>

          <InputField label="UPI ID">
            <input
              type="text"
              value={config.upiId}
              onChange={e => setConfig({ ...config, upiId: e.target.value })}
              placeholder="example@upi"
              style={{ ...inputStyle, maxWidth: "360px" }}
            />
          </InputField>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}
          >
            <CheckCircle size={16} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
