import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, History, Filter, Crown, Download, Activity, CreditCard, CheckCircle, Clock3, XCircle } from 'lucide-react';

export default function Members() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', parentPhone: '', isPremium: false, subscriptionEndDate: '' });
  
  // History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [historyTab, setHistoryTab] = useState('attendance'); // 'attendance' or 'payments'
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const token = localStorage.getItem('adminToken');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://library-backend-1fhf.onrender.com/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load members');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAddModal = () => {
    setEditingUserId(null);
    setFormData({ name: '', phone: '', parentPhone: '', isPremium: false, subscriptionEndDate: '' });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setFormData({ 
      name: user.name, 
      phone: user.phone, 
      parentPhone: user.parentPhone || '', 
      isPremium: user.isPremium || false,
      subscriptionEndDate: user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  // RESTORED: Fetch and view individual user history
  const handleViewHistory = async (userId) => {
    const loadingToast = toast.loading('Fetching history...');
    try {
      const res = await axios.get(`https://library-backend-1fhf.onrender.com/api/admin/users/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUserHistory(res.data);
      setShowHistoryModal(true);
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.error('Failed to load user history', { id: loadingToast });
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingUserId ? 'Updating...' : 'Saving...');
    try {
      if (editingUserId) {
        await axios.put(`https://library-backend-1fhf.onrender.com/api/admin/users/${editingUserId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Member updated', { id: loadingToast });
      } else {
        await axios.post('https://library-backend-1fhf.onrender.com/api/admin/users', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Member added', { id: loadingToast });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this member forever? This cannot be undone.')) return;
    try {
      await axios.delete(`https://library-backend-1fhf.onrender.com/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Member removed');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete member');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery);
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'expired') return matchesSearch && new Date(u.subscriptionEndDate) < new Date();
    return matchesSearch && u.status === filterStatus;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
    if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const exportToCSV = () => {
    const headers = ['Name,Phone,Status,Premium,Valid Till'];
    const csvData = filteredUsers.map(u => 
      `${u.name},${u.phone},${u.status},${u.isPremium ? 'Yes' : 'No'},${new Date(u.subscriptionEndDate).toLocaleDateString()}`
    );
    const blob = new Blob([[headers.join('\n'), '\n', csvData.join('\n')]], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Data exported to CSV');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Members Directory</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage library patrons, subscriptions, and access.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={exportToCSV} className="premium-button bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 w-full sm:w-auto">
            <Download size={16} className="mr-2" /> Export
          </button>
          <button onClick={openAddModal} className="premium-button bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 w-full sm:w-auto">
            <Plus size={16} className="mr-2" /> Add Member
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="premium-input pl-9"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-40">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="premium-input pr-8 appearance-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending_payment">Pending</option>
              <option value="expired">Expired</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
          </div>
          <div className="relative flex-1 md:w-40">
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="premium-input pr-8 appearance-none cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pro Data Table */}
      <div className="pro-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/50 dark:bg-[#18181b] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3 font-medium">Member Details</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Valid Till</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-zinc-500 dark:text-zinc-400">
                    No members match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-medium text-xs shrink-0 border border-zinc-200 dark:border-zinc-700">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            {user.name}
                            {user.isPremium && <Crown size={12} className="text-amber-500 dark:text-amber-400" />}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">{user.phone}</p>
                      {user.parentPhone && <p className="text-[10px] text-zinc-400 mt-0.5">P: {user.parentPhone}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                        user.status === 'pending_payment' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                      }`}>
                        {user.status === 'pending_payment' ? 'Pending' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400 text-xs font-mono">
                      {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button onClick={() => handleViewHistory(user._id)} className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="View History">
                          <History size={14} />
                        </button>
                        <button onClick={() => handleEdit(user)} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete">
                          <Trash2 size={14} />
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

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden">
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#18181b]">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{editingUserId ? 'Edit Member' : 'New Member'}</h3>
                  <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    <X size={16} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveMember} className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Full Name</label>
                    <input required type="text" placeholder="John Doe" className="premium-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Phone Number</label>
                      <input required type="text" placeholder="+91..." className="premium-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Parent Phone</label>
                      <input type="text" placeholder="Optional" className="premium-input" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
                    </div>
                  </div>

                  {editingUserId && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Valid Until</label>
                      <input type="date" className="premium-input" value={formData.subscriptionEndDate} onChange={e => setFormData({...formData, subscriptionEndDate: e.target.value})} />
                    </div>
                  )}

                  <label className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors bg-white dark:bg-[#18181b]">
                    <div className="flex items-center gap-3">
                      <Crown size={16} className={formData.isPremium ? 'text-amber-500' : 'text-zinc-400'} />
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Premium Plan</span>
                    </div>
                    <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} />
                  </label>

                  <div className="pt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowModal(false)} className="premium-button text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Cancel
                    </button>
                    <button type="submit" className="premium-button bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                      {editingUserId ? 'Save' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RESTORED: User History Modal */}
      <AnimatePresence>
        {showHistoryModal && selectedUserHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowHistoryModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden">
                
                {/* Header */}
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/50 dark:bg-[#18181b] shrink-0">
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{selectedUserHistory.user.name}'s Log</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{selectedUserHistory.user.phone}</p>
                  </div>
                  <button onClick={() => setShowHistoryModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* iOS Segmented Tabs */}
                <div className="px-5 pt-4 shrink-0">
                  <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <button 
                      onClick={() => setHistoryTab('attendance')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${historyTab === 'attendance' ? 'bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      <Activity size={14} /> Attendance
                    </button>
                    <button 
                      onClick={() => setHistoryTab('payments')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${historyTab === 'payments' ? 'bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      <CreditCard size={14} /> Payments
                    </button>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-5 overflow-y-auto flex-1">
                  {historyTab === 'attendance' ? (
                    <div className="space-y-3">
                      {selectedUserHistory.attendance.length === 0 ? (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-8">No attendance records found.</p>
                      ) : (
                        selectedUserHistory.attendance.map(a => (
                          <div key={a._id} className="flex justify-between items-center pro-card p-3">
                            <div>
                              <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'} to {a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}
                              </div>
                            </div>
                            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-500/20">
                              {a.totalMinutes} min
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedUserHistory.payments.length === 0 ? (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-8">No payment records found.</p>
                      ) : (
                        selectedUserHistory.payments.map(p => (
                          <div key={p._id} className="pro-card p-3 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <div className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                                ₹{p.amount}
                              </div>
                              <span className={`badge ${p.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : p.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                                {p.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
                              <span className="font-mono">UTR: {p.utrNumber}</span>
                              <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}