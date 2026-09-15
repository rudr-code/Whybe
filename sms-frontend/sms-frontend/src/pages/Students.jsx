import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StudentModal from "../components/StudentModal";

const chipClass = { paid: "chip-paid", pending: "chip-pending", overdue: "chip-overdue" };

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user } = useAuth();

  const canEdit = user?.role === "admin" || user?.role === "faculty";
  const canDelete = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
    if (!confirm("Delete this student record?")) return;
    try {
      await api.delete(`/students/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const filtered = students.filter((s) =>
    `${s.name} ${s.rollNo} ${s.class}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-ink mb-1">Students</h1>
          <p className="text-sm text-slate">{students.length} records</p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="bg-indigo hover:bg-indigo-light text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            Add student
          </button>
        )}
      </div>

      <input
        placeholder="Search by name, roll no. or class..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-black/10 rounded-md px-3 py-2 text-sm mb-5 focus:border-indigo outline-none"
      />

      {error && <div className="chip chip-overdue !inline-block !rounded-md !px-4 !py-2 mb-4">{error}</div>}

      <div className="bg-white border border-black/5 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs text-slate">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Roll no.</th>
              <th className="px-5 py-3 font-medium">Class</th>
              <th className="px-5 py-3 font-medium">Fee status</th>
              <th className="px-5 py-3 font-medium">Grade</th>
              {canEdit && <th className="px-5 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate">No students found</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s._id} className="border-b border-black/5 last:border-0 hover:bg-paper/60">
                  <td className="px-5 py-3 font-medium text-ink">{s.name}</td>
                  <td className="px-5 py-3 text-slate">{s.rollNo}</td>
                  <td className="px-5 py-3 text-slate">{s.class}</td>
                  <td className="px-5 py-3">
                    <span className={`chip ${chipClass[s.feeStatus]}`}>{s.feeStatus}</span>
                  </td>
                  <td className="px-5 py-3 text-slate">{s.grade || "—"}</td>
                  {canEdit && (
                    <td className="px-5 py-3 text-right space-x-3">
                      <button
                        onClick={() => { setEditing(s); setModalOpen(true); }}
                        className="text-xs font-medium text-indigo hover:underline"
                      >
                        Edit
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="text-xs font-medium text-bad hover:underline"
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

      {modalOpen && (
        <StudentModal
          student={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Students;
