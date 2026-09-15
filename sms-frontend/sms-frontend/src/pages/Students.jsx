import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StudentModal from "../components/StudentModal";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user } = useAuth();

  const canEdit = user?.role === "admin" || user?.role === "faculty" || user?.role === "ta";
  const canDelete = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 25 };
      if (branch) params.branch = branch;
      if (section) params.section = section;
      if (search) params.search = search;

      const { data } = await api.get("/students", { params });
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, branch, section]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleSave = async (form) => {
    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, form);
      } else {
        await api.post("/students", form);
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this student record?")) return;
    try {
      await api.delete(`/students/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Student Records Management</h1>
          <p className="text-xs text-slate mt-0.5">
            {total} enrolled students &bull; Kaggle examination dataset repository
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-crimson/10 border border-crimson/30 rounded-xl text-xs text-crimson font-medium">
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-platinum rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by student name, roll number, or institutional email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-paper border border-platinum rounded-xl pl-9 pr-3 py-2 text-xs text-ink outline-none focus:border-emerald"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-slate"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-jet text-white text-xs font-bold hover:bg-black transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              setPage(1);
            }}
            className="bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
          >
            <option value="">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="AI_ML">AI & ML</option>
            <option value="ECE">ECE</option>
            <option value="ME">Mechanical</option>
            <option value="CE">Civil</option>
          </select>

          <select
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
              setPage(1);
            }}
            className="bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
            <option value="E">Section E</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-paper border-b border-platinum text-slate uppercase text-[10px]">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">Branch & Sec</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Fee Status</th>
                {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="py-10 text-center text-slate">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="py-10 text-center text-slate">
                    No students match the selected query.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-paper/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-ink">{s.rollNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink">{s.name}</div>
                      <div className="text-[11px] text-slate font-mono">{s.email}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate">
                      {s.branch} &bull; Sec {s.section}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate">{s.contact || "—"}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          s.feeStatus === "paid"
                            ? "bg-emerald/15 text-emerald"
                            : s.feeStatus === "overdue"
                            ? "bg-crimson/15 text-crimson"
                            : "bg-platinum text-ink"
                        }`}
                      >
                        {s.feeStatus?.toUpperCase()}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditing(s);
                            setModalOpen(true);
                          }}
                          className="text-xs font-semibold text-emerald hover:underline"
                        >
                          Edit
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="text-xs font-semibold text-crimson hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-platinum flex items-center justify-between bg-paper text-xs text-slate">
          <span>Showing page {page} &bull; {total} total students</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-platinum bg-white text-ink disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={students.length < 25}
              className="px-3 py-1 rounded-lg border border-platinum bg-white text-ink disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <StudentModal
          student={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
