import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function StudentFees() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    async function fetchStudent() {
      try {
        setLoading(true);
        const sId = user?.studentRef || "student-0001";
        const { data } = await api.get(`/students/${sId}`);
        setStudent(data);
      } catch (err) {
        console.error("Failed to load fee info", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [user]);

  const handlePayNow = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaySuccess(true);
      if (student) {
        setStudent({ ...student, feeStatus: "paid" });
      }
    }, 1200);
  };

  const isPaid = student?.feeStatus === "paid" || paySuccess;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Tuition & Campus Fee Portal</h1>
        <p className="text-xs text-slate mt-0.5">
          Billing statements, payment history, and official fee clearance receipts
        </p>
      </div>

      {/* Main Status Card */}
      <div className="bg-white border border-platinum rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isPaid
                  ? "bg-emerald/15 text-emerald border border-emerald/30"
                  : "bg-crimson/15 text-crimson border border-crimson/30"
              }`}
            >
              {isPaid ? "Cleared & Verified" : student?.feeStatus?.toUpperCase() || "PENDING"}
            </span>
            <span className="text-xs text-slate font-mono">Invoice #CS-2026-S3-089</span>
          </div>

          <h2 className="font-heading text-3xl font-extrabold text-ink mt-1">
            Rs. {student?.feeAmount ? student.feeAmount.toLocaleString() : "75,000"}
          </h2>
          <p className="text-xs text-slate mt-1">
            {isPaid
              ? "All dues for Semester 3 have been settled. No penalty or outstanding balance."
              : "Due date: September 30, 2026. A late fine of Rs. 500 applies past due date."}
          </p>
        </div>

        <div>
          {!isPaid ? (
            <button
              onClick={handlePayNow}
              disabled={isPaying}
              className="px-6 py-3 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-lg shadow-emerald/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPaying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Pay Now via Campus Gateway</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald bg-emerald/10 px-4 py-2.5 rounded-xl border border-emerald/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Fee Paid &bull; Receipt #90214</span>
            </div>
          )}
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
        <h3 className="font-heading text-base font-bold text-ink mb-4">Semester 3 Fee Breakdown</h3>
        <div className="divide-y divide-platinum">
          {[
            { item: "Academic Tuition Fee (Semester 3)", amount: 50000, desc: "Course credits & laboratory maintenance" },
            { item: "Hostel Accommodation & Utility Charges", amount: 15000, desc: "Room electricity, Wi-Fi & facility care" },
            { item: "Mess & Dining Service Plan", amount: 7000, desc: "Breakfast, lunch, snacks, dinner 7-days" },
            { item: "Examination & University Regulatory Fee", amount: 3000, desc: "End-semester hall ticket & answer sheets" },
          ].map((entry) => (
            <div key={entry.item} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-ink">{entry.item}</h4>
                <p className="text-[11px] text-slate mt-0.5">{entry.desc}</p>
              </div>
              <span className="font-mono font-bold text-xs text-ink whitespace-nowrap">
                Rs. {entry.amount.toLocaleString()}
              </span>
            </div>
          ))}

          <div className="py-4 flex items-center justify-between font-bold text-sm bg-paper px-4 rounded-xl mt-2">
            <span className="text-ink">Total Payable Amount</span>
            <span className="font-mono text-emerald text-base">
              Rs. {student?.feeAmount ? student.feeAmount.toLocaleString() : "75,000"}
            </span>
          </div>
        </div>
      </div>

      {/* Payment History & Receipts */}
      <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
        <h3 className="font-heading text-base font-bold text-ink mb-3">Transaction Receipts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-platinum text-slate uppercase text-[10px]">
                <th className="py-2.5 px-3">Receipt ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              <tr className="hover:bg-paper/50">
                <td className="py-3 px-3 font-mono font-bold text-ink">RCP-2025-S2</td>
                <td className="py-3 px-3 text-slate">Jan 12, 2026</td>
                <td className="py-3 px-3 text-slate">Online NetBanking</td>
                <td className="py-3 px-3 font-mono font-bold text-ink">Rs. 75,000</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald/10 text-emerald">
                    Completed
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => alert("Downloading PDF Receipt...")}
                    className="text-xs font-semibold text-emerald hover:underline"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-paper/50">
                <td className="py-3 px-3 font-mono font-bold text-ink">RCP-2025-S1</td>
                <td className="py-3 px-3 text-slate">Aug 08, 2025</td>
                <td className="py-3 px-3 text-slate">UPI Auto-Debit</td>
                <td className="py-3 px-3 font-mono font-bold text-ink">Rs. 75,000</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald/10 text-emerald">
                    Completed
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => alert("Downloading PDF Receipt...")}
                    className="text-xs font-semibold text-emerald hover:underline"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
