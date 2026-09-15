import { useState, useEffect } from "react";

const emptyForm = {
  name: "", rollNo: "", class: "", email: "", contact: "",
  feeStatus: "pending", feeAmount: 0, grade: "",
};

const StudentModal = ({ student, onClose, onSave }) => {
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="font-serif text-xl text-ink mb-5">
          {student ? "Edit student" : "Add student"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Roll no.</label>
              <input name="rollNo" value={form.rollNo} onChange={handleChange} required
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Class</label>
              <input name="class" value={form.class} onChange={handleChange} required
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Contact</label>
              <input name="contact" value={form.contact} onChange={handleChange}
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Fee status</label>
              <select name="feeStatus" value={form.feeStatus} onChange={handleChange}
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Fee amount</label>
              <input name="feeAmount" type="number" value={form.feeAmount} onChange={handleChange}
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Grade</label>
              <input name="grade" value={form.grade} onChange={handleChange}
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate hover:text-ink">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm font-medium bg-indigo hover:bg-indigo-light text-white rounded-md">
              {student ? "Save changes" : "Add student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
