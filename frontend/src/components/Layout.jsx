import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings as SettingsIcon,
  LogOut,
  CreditCard,
  Bell,
  Search,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/members", label: "Members", icon: Users },
    { path: "/payments", label: "Payments", icon: CreditCard },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#0f0f13" }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, #13131a 0%, #0f0f16 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              }}
            >
              <BookOpen size={18} color="white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">LibPro</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 mb-4" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <p
            className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.15))",
                        border: "1px solid rgba(124,58,237,0.3)",
                        color: "#a78bfa",
                      }
                    : {
                        color: "rgba(255,255,255,0.45)",
                        border: "1px solid transparent",
                      }
                }
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={
                    active
                      ? { background: "rgba(124,58,237,0.3)" }
                      : { background: "rgba(255,255,255,0.05)" }
                  }
                >
                  <Icon size={16} />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <ChevronRight size={14} className="ml-auto" style={{ color: "#7c3aed" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Premium Card */}
        <div className="mx-3 mb-3">
          <div
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.15))",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#22c55e" }}
              />
              <span className="text-xs font-semibold" style={{ color: "#86efac" }}>
                Premium · Active
              </span>
            </div>
            <p className="text-white text-sm font-medium">Smart Attendance</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Valid through 2026
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 pt-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all"
            style={{ color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <LogOut size={16} />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "#f8f7ff" }}>
        {/* Header */}
        <header
          className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
          style={{
            background: "rgba(248,247,255,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(124,58,237,0.08)",
          }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1e1b4b" }}>
              Good Evening 👋
            </h1>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Manage your library efficiently
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl min-w-[240px]"
              style={{
                background: "white",
                border: "1px solid rgba(124,58,237,0.15)",
                boxShadow: "0 1px 4px rgba(124,58,237,0.06)",
              }}
            >
              <Search size={15} style={{ color: "#c4b5fd" }} />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent outline-none w-full text-sm"
                style={{ color: "#1e1b4b" }}
              />
            </div>

            {/* Notifications */}
            <button
              className="relative h-10 w-10 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: "white",
                border: "1px solid rgba(124,58,237,0.15)",
                color: "#7c3aed",
              }}
            >
              <Bell size={17} />
              <span
                className="absolute top-2 right-2 h-2 w-2 rounded-full"
                style={{ background: "#ef4444" }}
              />
            </button>

            {/* Avatar */}
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
