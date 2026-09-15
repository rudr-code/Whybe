import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ExamCellSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("ALL");
  const [credits, setCredits] = useState(3);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/subjects");
      setSubjects(data);
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setCode("");
    setName("");
    setBranch("ALL");
    setCredits(3);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingSubject(s);
    setCode(s.code);
    setName(s.name);
    setBranch(s.branch || "ALL");
    setCredits(s.credits || 3);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject._id}`, {
          code,
          name,
          branch,
          credits: parseInt(credits, 10),
        });
      } else {
        await api.post("/subjects", {
          code,
          name,
          branch,
          semester: "3",
          credits: parseInt(credits, 10),
        });
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      alert("Error saving subject: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course subject from the university curriculum?")) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert("Failed to delete subject: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">University Course Curriculum</h1>
          <p className="text-xs text-slate mt-0.5">
            Manage degree course codes, semester credit weightage, and faculty allocations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Course Subject
        </button>
      </div>

      {/* Subjects Table */}
      <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-paper border-b border-platinum text-slate uppercase text-[10px]">
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-3">Branch Eligibility</th>
                <th className="py-3 px-3 text-center">Semester</th>
                <th className="py-3 px-3 text-center">Credits</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate">Loading subjects catalog...</td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate">No subjects registered yet.</td>
                </tr>
              ) : (
                subjects.map((subj) => (
                  <tr key={subj._id} className="hover:bg-paper/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">{subj.code}</td>
                    <td className="py-3.5 px-4 font-bold text-ink">{subj.name}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate">
                      <span className="px-2 py-0.5 rounded-md bg-paper border border-platinum">
                        {subj.branch || "ALL"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate">{subj.semester || "3"}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-emerald">{subj.credits || 3}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(subj)}
                        className="text-xs font-semibold text-emerald hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subj._id)}
                        className="text-xs font-semibold text-crimson hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-platinum rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-platinum mb-4">
              <h3 className="font-heading text-base font-bold text-ink">
                {editingSubject ? "Edit Course Subject" : "Create New Subject Entry"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full border border-platinum flex items-center justify-center text-slate hover:text-ink hover:bg-paper"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS301, MA201"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink font-mono outline-none focus:border-emerald focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Full Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:border-emerald focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate mb-1">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
                  >
                    <option value="ALL">All Branches</option>
                    <option value="CSE">CSE</option>
                    <option value="AI_ML">AI & ML</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate mb-1">Credit Weightage</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2 text-xs text-ink font-mono outline-none focus:border-emerald focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-platinum">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate hover:text-ink hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald hover:bg-emerald-dark shadow-md shadow-emerald/20 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
