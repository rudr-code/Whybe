import { useState } from "react";
import api from "../../api/axios";

export default function ExamCellGradeOverride() {
  const [searchQuery, setSearchQuery] = useState("CSE-001");
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [overrideFeedback, setOverrideFeedback] = useState("");

  // Edit mark modal
  const [selectedMark, setSelectedMark] = useState(null);
  const [endSem, setEndSem] = useState(0);
  const [grade, setGrade] = useState("A");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchError("");
    setOverrideFeedback("");
    setLoading(true);

    try {
      // Find student by search query
      const { data } = await api.get("/students", { params: { search: searchQuery.trim(), limit: 1 } });
      if (!data.students || data.students.length === 0) {
        setSearchError(`No student found matching "${searchQuery}"`);
        setStudent(null);
        setMarks([]);
        return;
      }

      const s = data.students[0];
      setStudent(s);

      // Fetch student's marks
      const marksRes = await api.get(`/marks/student/${s._id}`);
      setMarks(marksRes.data);
    } catch (err) {
      setSearchError("Failed to fetch student: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOverride = (m) => {
    setSelectedMark(m);
    setEndSem(m.endSem);
    setGrade(m.grade);
    setRemarks("Re-evaluation verification / moderation applied");
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!selectedMark) return;
    setSaving(true);

    try {
      const mid1 = selectedMark.midSem1 || 0;
      const mid2 = selectedMark.midSem2 || 0;
      const internal = selectedMark.internal || 0;
      const parsedEnd = parseInt(endSem, 10) || 0;
      const newTotal = mid1 + mid2 + parsedEnd + internal;

      await api.put(`/marks/${selectedMark._id}`, {
        endSem: parsedEnd,
        total: newTotal,
        grade,
      });

      setOverrideFeedback(`Official grade override saved for ${selectedMark.subjectName}: New Grade ${grade}!`);
      setSelectedMark(null);
      // Refresh marks
      const marksRes = await api.get(`/marks/student/${student._id}`);
      setMarks(marksRes.data);
    } catch (err) {
      alert("Error applying grade override: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">
          Official Grade Verification & Override Desk
        </h1>
        <p className="text-xs text-slate mt-0.5">
          Controller of Examinations authority to moderate end-semester evaluation and re-evaluated scripts
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              required
              placeholder="Enter Student Roll Number (e.g. CSE-001, AI_ML-015)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper border border-platinum rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink outline-none focus:border-emerald font-mono"
            />
            <svg
              className="w-4 h-4 absolute left-3.5 top-3 text-slate"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-jet hover:bg-black text-white text-xs font-bold transition-colors shrink-0 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Retrieve Marksheet"}
          </button>
        </form>

        {searchError && (
          <div className="mt-3 text-xs text-crimson font-medium">{searchError}</div>
        )}
      </div>

      {overrideFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold">
          {overrideFeedback}
        </div>
      )}

      {/* Student Profile & Marksheet */}
      {student && (
        <div className="space-y-6">
          <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-ink">{student.name}</h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-paper border border-platinum text-slate">
                  {student.rollNo}
                </span>
              </div>
              <p className="text-xs text-slate mt-0.5">
                Branch: <span className="font-semibold text-ink">{student.branch}</span> &bull; Section: {student.section} &bull; Email: {student.email}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald bg-emerald/10 px-3 py-1 rounded-full self-start sm:self-auto">
              Candidate Verified
            </span>
          </div>

          <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-platinum bg-paper flex items-center justify-between">
              <h4 className="font-heading text-sm font-bold text-ink">Evaluated Courses & Modifiable Scores</h4>
              <span className="text-xs text-slate">Click &quot;Override&quot; to modify grades</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-paper/60 border-b border-platinum text-slate uppercase text-[10px]">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-3 text-center">Mid-1 (25)</th>
                    <th className="py-3 px-3 text-center">Mid-2 (25)</th>
                    <th className="py-3 px-3 text-center">End-Sem (40)</th>
                    <th className="py-3 px-3 text-center">Internal (10)</th>
                    <th className="py-3 px-3 text-center font-bold text-ink">Total (100)</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-4 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-platinum">
                  {marks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate">No marks recorded.</td>
                    </tr>
                  ) : (
                    marks.map((m) => (
                      <tr key={m._id} className="hover:bg-paper/50">
                        <td className="py-3 px-4 font-bold text-ink">
                          <div>{m.subjectName}</div>
                          <span className="text-[10px] font-mono text-slate">{m.subjectCode}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{m.midSem1}</td>
                        <td className="py-3 px-3 text-center font-mono">{m.midSem2}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-ink">{m.endSem}</td>
                        <td className="py-3 px-3 text-center font-mono">{m.internal}</td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold text-ink">{m.total}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-paper border border-platinum text-ink">
                            {m.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenOverride(m)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-emerald hover:bg-emerald/10 border border-emerald/30 transition-colors"
                          >
                            Override Grade
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Override Modal */}
      {selectedMark && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-platinum rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-platinum mb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-ink">Official Grade Override</h3>
                <p className="text-xs text-slate">{selectedMark.subjectName} &bull; {selectedMark.subjectCode}</p>
              </div>
              <button
                onClick={() => setSelectedMark(null)}
                className="w-7 h-7 rounded-full border border-platinum flex items-center justify-center text-slate hover:text-ink hover:bg-paper"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate mb-1">End-Sem Marks (Max 40)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    required
                    value={endSem}
                    onChange={(e) => setEndSem(e.target.value)}
                    className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate mb-1">Final Letter Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink font-mono font-bold outline-none focus:border-emerald"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C+">C+ (Fair)</option>
                    <option value="C">C (Pass)</option>
                    <option value="D">D (Marginal)</option>
                    <option value="F">F (Fail)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Official Moderation Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="State the justification for re-evaluation or moderation..."
                  className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-platinum">
                <button
                  type="button"
                  onClick={() => setSelectedMark(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate hover:text-ink hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald hover:bg-emerald-dark shadow-md shadow-emerald/20 transition-all disabled:opacity-50"
                >
                  {saving ? "Applying..." : "Confirm & Save Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
