import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const PatientPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'payments'),
          where('patientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const pays = [];
        snapshot.forEach(doc => pays.push({ id: doc.id, ...doc.data() }));
        setPayments(pays);
      } catch (error) {
        console.error('Error fetching payments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Payment History</h1>
        <p className="text-sm text-slate-500 mt-1">Review your transactions and download receipts.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner /></div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-800 font-medium">
                      {pay.razorpayPaymentId || `TXN-${pay.id.slice(0,8).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-4">
                      {pay.createdAt?.toDate ? pay.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₹{pay.amount}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {pay.method}
                    </td>
                    <td className="px-6 py-4">
                      {pay.status === 'completed' || pay.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <CreditCard className="mx-auto mb-4 text-slate-300" size={64} />
            <h3 className="text-lg font-bold text-slate-800">No Payment History</h3>
            <p className="text-sm text-slate-500 mt-2">You haven't made any payments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPayments;
