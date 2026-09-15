import { useState, useEffect } from "react";

const emptyForm = {
  name: "",
  rollNo: "",
  branch: "CSE",
  section: "A",
  semester: "3",
  gender: "male",
  email: "",
  contact: "",
  dob: "2005-01-01",
  feeStatus: "paid",
  feeAmount: 75000,
};

export default function StudentModal({ student, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (student) setForm({ ...emptyForm, ...student });
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4">
      <div className="bg-white border border-platinum rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-platinum">
          <h2 className="font-heading text-lg font-bold text-ink">
            {student ? "Edit Student Record" : "Register New Student"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-platinum flex items-center justify-center text-slate hover:text-ink hover:bg-paper"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Aarav Sharma"
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Roll Number</label>
              <input
                name="rollNo"
                value={form.rollNo}
                onChange={handleChange}
                required
                placeholder="e.g. CSE-001"
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Branch</label>
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald outline-none"
              >
                <option value="CSE">CSE</option>
                <option value="AI_ML">AI & ML</option>
                <option value="ECE">ECE</option>
                <option value="ME">Mech</option>
                <option value="CE">Civil</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Section</label>
              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald outline-none"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
                <option value="E">Section E</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Institutional Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@campussync.edu"
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Date of Birth (Login Password)</label>
              <input
                name="dob"
                type="text"
                placeholder="YYYY-MM-DD"
                value={form.dob}
                onChange={handleChange}
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Fee Status</label>
              <select
                name="feeStatus"
                value={form.feeStatus}
                onChange={handleChange}
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald outline-none"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Fee Amount (Rs.)</label>
              <input
                name="feeAmount"
                type="number"
                value={form.feeAmount}
                onChange={handleChange}
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Phone Contact</label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink focus:border-emerald focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-platinum">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate hover:text-ink hover:bg-paper rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald hover:bg-emerald-dark text-white rounded-xl shadow-md shadow-emerald/20 transition-all"
            >
              {student ? "Save Changes" : "Register Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
