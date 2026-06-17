import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import { CreditCard, AlertCircle } from 'lucide-react';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // Fetch payments and users in parallel to map patient names
        const [paySnapshot, userSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'users'))
        ]);
        
        // Build a dictionary of user details
        const usersMap = {};
        userSnapshot.docs.forEach(doc => {
          usersMap[doc.id] = doc.data();
        });

        const paymentsData = paySnapshot.docs.map(doc => {
          const data = doc.data();
          const patientUser = usersMap[data.patientId] || {};
          return {
            id: doc.id,
            patientName: patientUser.name || 'Anonymous User',
            patientEmail: patientUser.email || '',
            ...data
          };
        });
        
        setPayments(paymentsData);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payments data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <CreditCard className="text-purple-500" size={32} />
            Payments Administration
          </h1>
          <p className="text-slate-500 mt-2">View and manage all transaction records.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Payments Found</h3>
            <p className="text-slate-500">There are no transaction records yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Transaction ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => {
                  const dateObj = payment.createdAt?.toDate ? payment.createdAt.toDate() : new Date(payment.createdAt);
                  const formattedDate = isNaN(dateObj) ? 'Unknown Date' : dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500">{payment.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{payment.patientName}</p>
                        {payment.patientEmail && <p className="text-xs text-slate-500">{payment.patientEmail}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">₹{payment.amount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {payment.status || 'Success'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePayments;
