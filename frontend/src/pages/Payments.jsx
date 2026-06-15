import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';

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
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load pending payments');
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleVerify = async (id, action) => {
    try {
      await axios.post(`https://library-backend-1fhf.onrender.com/api/admin/payments/${id}/verify`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Payment ${action}ed successfully`);
      fetchPayments();
    } catch (err) {
      toast.error(`Failed to ${action} payment`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 size={20} className="animate-spin" style={{ color: "#7c3aed" }} />
        <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>Loading payments...</span>
      </div>
    );
  }

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#1e1b4b" }}>Payment Verification</h1>
        <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>Review and approve member payments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Pending Requests", value: payments.length, color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.15)" },
          { label: "Total Amount", value: `₹${totalAmount}`, color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.15)" },
          { label: "Awaiting Approval", value: payments.length, color: "#d97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.15)" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: "white", border: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 2px 12px rgba(124,58,237,0.05)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>{label}</p>
            <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Payment Cards */}
      {payments.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: "white", border: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 2px 12px rgba(124,58,237,0.05)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.08)" }}
          >
            <CreditCard size={28} style={{ color: "#c4b5fd" }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: "#1e1b4b" }}>All caught up!</h3>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>No pending payments to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "white", border: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 2px 12px rgba(124,58,237,0.05)" }}
            >
              {/* Card Header */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: "rgba(248,247,255,0.8)", borderBottom: "1px solid rgba(124,58,237,0.07)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", color: "#7c3aed" }}
                  >
                    {(payment.userId?.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#1e1b4b" }}>{payment.userId?.name || "Unknown"}</p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>{payment.userId?.phone}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#fef3c7", color: "#d97706" }}>
                  Pending
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>Amount</p>
                    <p className="text-2xl font-bold" style={{ color: "#059669" }}>₹{payment.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>UTR</p>
                    <p className="text-sm font-mono" style={{ color: "#1e1b4b" }}>{payment.utrNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>Date</p>
                    <p className="text-sm" style={{ color: "#1e1b4b" }}>{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedImage(`https://library-backend-1fhf.onrender.com${payment.screenshotUrl}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "rgba(124,58,237,0.08)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.15)" }}
                  >
                    <Eye size={15} /> View Proof
                  </button>
                  <button
                    onClick={() => handleVerify(payment._id, "verify")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "rgba(5,150,105,0.08)", color: "#059669", border: "1px solid rgba(5,150,105,0.2)" }}
                  >
                    <CheckCircle size={15} /> Verify
                  </button>
                  <button
                    onClick={() => handleVerify(payment._id, "reject")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)" }}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(15,15,19,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{ background: "white" }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#ef4444", color: "white" }}
            >
              <XCircle size={16} />
            </button>
            <img src={selectedImage} alt="Payment Proof" className="w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
