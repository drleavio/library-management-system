import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, X, FileText, IndianRupee, Clock } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const token = localStorage.getItem('adminToken');

  const fetchPayments = async () => {
    try {
      const res = await axios.get('https://library-backend-1fhf.onrender.com/api/admin/payments/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (err) {
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleVerify = async (id, action) => {
    const loadingId = toast.loading('Processing...');
    try {
      await axios.post(`https://library-backend-1fhf.onrender.com/api/admin/payments/${id}/verify`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Payment ${action}ed successfully`, { id: loadingId });
      fetchPayments();
    } catch (err) {
      toast.error(`Failed to process payment`, { id: loadingId });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 dark:text-zinc-400 space-y-4">
        <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Syncing Ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Verification Queue</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Review pending subscription transfers.</p>
        </div>
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5">
          <Clock size={14} /> {payments.length} Pending
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        <AnimatePresence>
          {payments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="pro-card p-12 text-center border-dashed border-zinc-300 dark:border-zinc-700"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Queue Cleared</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">No pending verification requests.</p>
            </motion.div>
          ) : (
            payments.map((payment, index) => (
              <motion.div 
                key={payment._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="pro-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Transaction Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0 border border-zinc-200 dark:border-zinc-700">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{payment.userId?.name || 'Unknown User'}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{payment.userId?.phone}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Ref: {payment.utrNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Amount */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Amount</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center">
                      <IndianRupee size={14} className="mr-0.5 text-zinc-400" /> {payment.amount}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setSelectedImage(`https://library-backend-1fhf.onrender.com${payment.screenshotUrl}`)}
                      className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                      title="View Proof"
                    >
                      <FileText size={16} />
                    </button>
                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                    <button 
                      onClick={() => handleVerify(payment._id, 'reject')}
                      className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={() => handleVerify(payment._id, 'verify')}
                      className="premium-button bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 py-1.5 px-3 text-xs ml-1"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/90 dark:bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-6 right-6 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="relative max-w-2xl w-full bg-zinc-950 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-3 border-b border-white/10 bg-zinc-900 text-zinc-400 flex items-center gap-2 text-xs font-medium">
                <FileText size={14} /> Payment Attachment
              </div>
              <div className="p-4 flex justify-center items-center min-h-[300px]">
                <img src={selectedImage} alt="Receipt" className="max-w-full max-h-[70vh] object-contain rounded" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}