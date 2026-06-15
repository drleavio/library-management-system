import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpen, ShieldCheck, Users, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [libraryName, setLibraryName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://library-backend-1fhf.onrender.com/api/admin/request-otp', { phone });
      toast.success('OTP sent to WhatsApp');
      setStep(2);
    } catch (err) {
      toast.error('Failed to send OTP');
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
      toast.success(isLogin ? 'Logged in successfully' : 'Library registered successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP or error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "white",
    outline: "none",
  };

  const features = [
    { icon: ShieldCheck, label: "Secure OTP Authentication", color: "#86efac" },
    { icon: Users, label: "Member Management", color: "#7dd3fc" },
    { icon: MessageCircle, label: "WhatsApp Automation", color: "#fde68a" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a12" }}>

      {/* LEFT – Brand panel */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 flex-col relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(145deg,#1a0533 0%,#0f0c2a 50%,#0a0a18 100%)" }} />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)", top: "-80px", left: "-80px" }} />
          <div className="absolute w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle,rgba(79,70,229,0.15) 0%,transparent 70%)", bottom: "80px", right: "-60px" }} />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
            >
              <BookOpen size={20} color="white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">LibPro</span>
          </div>

          {/* Main copy */}
          <div className="mb-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-semibold" style={{ color: "#c4b5fd" }}>Library Management System</span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-white mb-6">
              Smart Library
              <br />
              <span style={{ background: "linear-gradient(135deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Management
              </span>
            </h1>

            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Manage members, attendance, payments, and WhatsApp automation from one modern dashboard.
            </p>

            <div className="mt-10 space-y-4">
              {features.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2026 LibPro · All rights reserved</p>
        </div>
      </div>

      {/* RIGHT – Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
              <BookOpen size={16} color="white" />
            </div>
            <span className="text-white font-bold text-lg">LibPro</span>
          </div>

          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            {step === 1 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">{isLogin ? "Welcome back" : "Create account"}</h2>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {isLogin ? "Sign in to your library admin portal" : "Register your library to get started"}
                  </p>
                </div>

                {/* Tab */}
                <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {["Login", "Register"].map((tab, i) => {
                    const active = isLogin ? i === 0 : i === 1;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setIsLogin(i === 0)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                        style={
                          active
                            ? { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", boxShadow: "0 2px 10px rgba(124,58,237,0.3)" }
                            : { color: "rgba(255,255,255,0.4)" }
                        }
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Your Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={inputStyle} required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Library Name</label>
                        <input type="text" value={libraryName} onChange={e => setLibraryName(e.target.value)} placeholder="Central Library" style={inputStyle} required />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>WhatsApp Number</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" style={inputStyle} required />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Send OTP via WhatsApp
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">Enter OTP</h2>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                    We sent a code to your WhatsApp number
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>OTP Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="1234"
                      style={{ ...inputStyle, textAlign: "center", fontSize: "22px", letterSpacing: "6px", fontWeight: "bold" }}
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isLogin ? "Sign In" : "Create Library"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
