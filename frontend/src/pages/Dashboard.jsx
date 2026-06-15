import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { Users, CreditCard, Activity, Star, AlertCircle, History, X, Search, ChevronDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, gradient, glow }) => (
  <div
    className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5"
    style={{
      background: "white",
      border: "1px solid rgba(124,58,237,0.08)",
      boxShadow: "0 2px 12px rgba(124,58,237,0.06)",
    }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: gradient, boxShadow: `0 4px 14px ${glow}` }}
    >
      <Icon size={20} color="white" />
    </div>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#94a3b8" }}>
        {title}
      </p>
      <h3 className="text-2xl font-bold mt-0.5" style={{ color: "#1e1b4b" }}>
        {value}
      </h3>
    </div>
  </div>
);

const Badge = ({ children, type }) => {
  const styles = {
    present: { background: "#dcfce7", color: "#16a34a" },
    absent: { background: "#f1f5f9", color: "#64748b" },
    active: { background: "#ede9fe", color: "#7c3aed" },
    pending_payment: { background: "#fee2e2", color: "#dc2626" },
    expired: { background: "#fef3c7", color: "#d97706" },
    premium: { background: "#fef9c3", color: "#ca8a04" },
  };
  const s = styles[type] || styles.absent;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={s}
    >
      {children}
    </span>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, pendingPayments: 0, activeNow: 0, premiumUsers: 0, expiredUsers: 0 });
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', parentPhone: '', isPremium: false, subscriptionEndDate: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAttendance, setFilterAttendance] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://library-backend-1fhf.onrender.com/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allUsers = res.data.users || [];
        setUsers(allUsers);
        setStats({
          totalUsers: allUsers.length,
          pendingPayments: allUsers.filter(u => u.status === 'pending_payment').length,
          activeNow: allUsers.filter(u => u.isPresent).length,
          premiumUsers: allUsers.filter(u => u.isPremium).length,
          expiredUsers: allUsers.filter(u => new Date(u.subscriptionEndDate) < new Date()).length
        });
      } catch (error) {
        console.error("Failed to load dashboard", error);
      }
    };
    fetchData();

    const libraryId = localStorage.getItem('libraryId');
    const socket = io('https://library-backend-1fhf.onrender.com');
    if (libraryId) {
      socket.on(`attendanceUpdate_${libraryId}`, () => { fetchData(); });
    }
    return () => { socket.disconnect(); };
  }, []);

  const openEditModal = (user) => {
    setEditingUserId(user._id);
    setFormData({
      name: user.name,
      phone: user.phone,
      parentPhone: user.parentPhone || '',
      isPremium: user.isPremium || false,
      subscriptionEndDate: new Date(user.subscriptionEndDate).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleViewHistory = async (userId) => {
    try {
      const res = await axios.get(`https://library-backend-1fhf.onrender.com/api/admin/users/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUserHistory(res.data);
      setShowHistoryModal(true);
    } catch (err) {
      toast.error('Failed to load user history');
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://library-backend-1fhf.onrender.com/api/admin/users/${editingUserId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Member updated successfully');
      setShowModal(false);
      const res = await axios.get('https://library-backend-1fhf.onrender.com/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const allUsers = res.data.users || [];
      setUsers(allUsers);
      setStats({
        totalUsers: allUsers.length,
        pendingPayments: allUsers.filter(u => u.status === 'pending_payment').length,
        activeNow: allUsers.filter(u => u.isPresent).length,
        premiumUsers: allUsers.filter(u => u.isPremium).length,
        expiredUsers: allUsers.filter(u => new Date(u.subscriptionEndDate) < new Date()).length
      });
    } catch (err) {
      toast.error('Failed to update member');
    }
  };

  const cards = [
    { title: 'Total Members', value: stats.totalUsers, icon: Users, gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)', glow: 'rgba(124,58,237,0.3)' },
    { title: 'Active Today', value: stats.activeNow, icon: Activity, gradient: 'linear-gradient(135deg,#059669,#10b981)', glow: 'rgba(16,185,129,0.3)' },
    { title: 'Premium Users', value: stats.premiumUsers, icon: Star, gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', glow: 'rgba(245,158,11,0.3)' },
    { title: 'Expired Plans', value: stats.expiredUsers, icon: AlertCircle, gradient: 'linear-gradient(135deg,#ea580c,#f97316)', glow: 'rgba(249,115,22,0.3)' },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard, gradient: 'linear-gradient(135deg,#e11d48,#f43f5e)', glow: 'rgba(244,63,94,0.3)' },
  ];

  const getFilteredAndSortedUsers = () => {
    let result = [...users];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q));
    }
    if (filterStatus !== 'all') {
      if (filterStatus === 'expired') {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        result = result.filter(u => new Date(u.subscriptionEndDate) < today);
      } else {
        result = result.filter(u => u.status === filterStatus);
      }
    }
    if (filterAttendance !== 'all') {
      result = result.filter(u => filterAttendance === 'present' ? u.isPresent : !u.isPresent);
    }
    result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      if (sortOrder === 'oldest') return new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now());
      if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });
    return result;
  };

  const filteredUsers = getFilteredAndSortedUsers();

  const selectStyle = {
    background: "white",
    border: "1px solid rgba(124,58,237,0.15)",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#1e1b4b",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    minWidth: "140px",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#1e1b4b" }}>Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>Monitor members, attendance and subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* Members Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 2px 16px rgba(124,58,237,0.06)" }}
      >
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(124,58,237,0.07)" }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: "#1e1b4b" }}>Members</h3>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{filteredUsers.length} records</p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 flex flex-col xl:flex-row gap-3" style={{ borderBottom: "1px solid rgba(124,58,237,0.06)", background: "rgba(248,247,255,0.6)" }}>
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#c4b5fd" }} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full outline-none text-sm pl-9 pr-3 py-2 rounded-xl"
              style={{ background: "white", border: "1px solid rgba(124,58,237,0.15)", color: "#1e1b4b" }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="expired">Expired</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#a78bfa" }} />
            </div>
            <div className="relative">
              <select value={filterAttendance} onChange={e => setFilterAttendance(e.target.value)} style={selectStyle}>
                <option value="all">All Attendance</option>
                <option value="present">Present Today</option>
                <option value="absent">Absent Today</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#a78bfa" }} />
            </div>
            <div className="relative">
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={selectStyle}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name A–Z</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#a78bfa" }} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.06)" }}>
                {["Name", "Phone", "Presence", "Time Today", "Status", "Valid Till", "Actions"].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm" style={{ color: "#94a3b8" }}>
                    No members match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr
                    key={user._id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid rgba(124,58,237,0.04)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(248,247,255,0.7)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", color: "#7c3aed" }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#1e1b4b" }}>{user.name}</p>
                          {user.isPremium && <Badge type="premium">Premium</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#64748b" }}>{user.phone}</td>
                    <td className="px-6 py-4">
                      <Badge type={user.isPresent ? "present" : "absent"}>
                        {user.isPresent ? "Present" : "Absent"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: "#7c3aed" }}>{user.todayMinutes} min</td>
                    <td className="px-6 py-4">
                      <Badge type={user.status}>{user.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#64748b" }}>
                      {new Date(user.subscriptionEndDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewHistory(user._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: "rgba(124,58,237,0.08)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.15)" }}
                        >
                          <History size={13} /> History
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: "rgba(79,70,229,0.08)", color: "#4f46e5", border: "1px solid rgba(79,70,229,0.15)" }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(15,15,19,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "white", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
              <h3 className="font-bold text-lg" style={{ color: "#1e1b4b" }}>Edit Member</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f1f5f9", color: "#64748b" }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              {[
                { label: "Name", key: "name", type: "text" },
                { label: "Phone", key: "phone", type: "text" },
                { label: "Valid Till", key: "subscriptionEndDate", type: "date" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#94a3b8" }}>{label}</label>
                  <input
                    required={key !== "subscriptionEndDate"}
                    type={type}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ border: "1px solid rgba(124,58,237,0.2)", color: "#1e1b4b", background: "#fafafa" }}
                    value={formData[key]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                  />
                </div>
              ))}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setFormData({ ...formData, isPremium: !formData.isPremium })}
                  className="relative w-10 h-5 rounded-full transition-all"
                  style={{ background: formData.isPremium ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "#e2e8f0" }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: formData.isPremium ? "calc(100% - 18px)" : "2px" }}
                  />
                </div>
                <span className="text-sm font-medium" style={{ color: "#1e1b4b" }}>Premium Member</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedUserHistory && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(15,15,19,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: "white", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
              <div>
                <h3 className="font-bold text-lg" style={{ color: "#1e1b4b" }}>{selectedUserHistory.user.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{selectedUserHistory.user.phone}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f1f5f9", color: "#64748b" }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: "#7c3aed" }}>Payment History</h4>
                {selectedUserHistory.payments.length === 0 ? (
                  <p className="text-sm" style={{ color: "#94a3b8" }}>No payment records found.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUserHistory.payments.map(p => (
                      <div key={p._id} className="flex justify-between items-center p-4 rounded-xl" style={{ background: "#f8f7ff", border: "1px solid rgba(124,58,237,0.07)" }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: "#1e1b4b" }}>₹{p.amount}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>UTR: {p.utrNumber}</p>
                          {p.screenshotUrl && (
                            <button
                              onClick={() => setSelectedImage(`https://library-backend-1fhf.onrender.com${p.screenshotUrl}`)}
                              className="text-xs mt-1 underline"
                              style={{ color: "#7c3aed" }}
                            >
                              View Screenshot
                            </button>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge type={p.status === 'verified' ? 'active' : p.status === 'rejected' ? 'pending_payment' : 'expired'}>
                            {p.status.toUpperCase()}
                          </Badge>
                          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: "#7c3aed" }}>Attendance Log</h4>
                {selectedUserHistory.attendance.length === 0 ? (
                  <p className="text-sm" style={{ color: "#94a3b8" }}>No attendance records found.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUserHistory.attendance.map(a => (
                      <div key={a._id} className="flex justify-between items-center p-4 rounded-xl" style={{ background: "#f8f7ff", border: "1px solid rgba(124,58,237,0.07)" }}>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#1e1b4b" }}>{new Date(a.date).toLocaleDateString()}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                            {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} → {a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                          </p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "#7c3aed" }}>{a.totalMinutes} min</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ background: "rgba(15,15,19,0.85)", backdropFilter: "blur(8px)" }} onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()} style={{ background: "white" }}>
            <button onClick={() => setSelectedImage(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#ef4444", color: "white" }}>
              <X size={16} />
            </button>
            <img src={selectedImage} alt="Payment Proof" className="w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
