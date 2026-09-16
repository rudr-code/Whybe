import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function TAMarksEntry() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [marksList, setMarksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data } = await api.get("/subjects");
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubjectId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    }
    fetchSubjects();
  }, []);

  const loadMarks = async () => {
    if (!selectedSubjectId) return;
    try {
      setLoading(true);
      setSaveMessage("");
      const { data } = await api.get(`/marks/subject/${selectedSubjectId}`, {
        params: { limit: 50 },
      });
      setMarksList(data.marks);
    } catch (err) {
      console.error("Failed to load marks for subject", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarks();
  }, [selectedSubjectId]);

  const calcGrade = (total) => {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B+";
    if (total >= 60) return "B";
    if (total >= 50) return "C+";
    if (total >= 40) return "C";
    if (total >= 30) return "D";
    return "F";
  };

  const handleScoreChange = (index, field, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    const updated = [...marksList];
    updated[index][field] = num;

    const mid1 = updated[index].midSem1 || 0;
    const mid2 = updated[index].midSem2 || 0;
    const end = updated[index].endSem || 0;
    const internal = updated[index].internal || 0;
    const total = mid1 + mid2 + end + internal;

    updated[index].total = total;
    updated[index].grade = calcGrade(total);
    setMarksList(updated);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      // Save all marks in parallel
      await Promise.all(
        marksList.map((m) =>
          api.post("/marks", {
            studentId: m.studentId,
            subjectId: selectedSubjectId,
            midSem1: m.midSem1,
            midSem2: m.midSem2,
            endSem: m.endSem,
            internal: m.internal,
            semester: "3",
          })
        )
      );
      setSaveMessage("All marks have been successfully saved and synced to student transcripts in MongoDB!");
      await loadMarks();
    } catch (err) {
      setSaveMessage("Error saving marks: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Bulk Marks Entry Grid</h1>
          <p className="text-xs text-slate mt-0.5">
            Teaching Assistant evaluation workstation for mid-term tests & lab coursework
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || marksList.length === 0}
          className="px-5 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Records...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save & Publish All Marks</span>
            </>
          )}
        </button>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold">
          {saveMessage}
        </div>
      )}

      {/* Subject Selector Bar */}
      <div className="bg-white border border-platinum rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <label className="text-xs font-bold text-ink whitespace-nowrap">Selected Subject:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink font-semibold outline-none focus:border-emerald flex-1 max-w-md"
        >
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.code} &mdash; {s.name} ({s.credits} Credits)
            </option>
          ))}
        </select>
        <span className="text-xs text-slate ml-auto hidden sm:inline">
          Editing Section A (Batch 2026)
        </span>
      </div>

      {/* Editable Table */}
      <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-paper border-b border-platinum text-slate uppercase text-[10px]">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-2 text-center w-28">Mid-Sem 1 (25)</th>
                <th className="py-3 px-2 text-center w-28">Mid-Sem 2 (25)</th>
                <th className="py-3 px-2 text-center w-28">End-Sem (40)</th>
                <th className="py-3 px-2 text-center w-28">Internal (10)</th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-4 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate">
                    Loading student score sheet...
                  </td>
                </tr>
              ) : marksList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate">
                    No student marks records found for this subject.
                  </td>
                </tr>
              ) : (
                marksList.map((row, idx) => (
                  <tr key={row._id} className="hover:bg-paper/50">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate">{row.rollNo}</td>
                    <td className="py-2.5 px-4 font-semibold text-ink">{row.studentName}</td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={row.midSem1}
                        onChange={(e) => handleScoreChange(idx, "midSem1", e.target.value)}
                        className="w-16 text-center font-mono font-bold bg-paper border border-platinum rounded-lg py-1 text-xs text-ink focus:border-emerald outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={row.midSem2}
                        onChange={(e) => handleScoreChange(idx, "midSem2", e.target.value)}
                        className="w-16 text-center font-mono font-bold bg-paper border border-platinum rounded-lg py-1 text-xs text-ink focus:border-emerald outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={row.endSem}
                        onChange={(e) => handleScoreChange(idx, "endSem", e.target.value)}
                        className="w-16 text-center font-mono font-bold bg-paper border border-platinum rounded-lg py-1 text-xs text-ink focus:border-emerald outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={row.internal}
                        onChange={(e) => handleScoreChange(idx, "internal", e.target.value)}
                        className="w-16 text-center font-mono font-bold bg-paper border border-platinum rounded-lg py-1 text-xs text-ink focus:border-emerald outline-none"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-sm text-ink">
                      {row.total}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold font-mono ${
                          row.grade === "A+" || row.grade === "A"
                            ? "bg-emerald/15 text-emerald"
                            : row.grade === "F"
                            ? "bg-crimson/15 text-crimson"
                            : "bg-platinum text-ink"
                        }`}
                      >
                        {row.grade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
