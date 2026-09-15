import { useState, useEffect } from "react";
import api from "../../api/axios";
import TimetableGrid from "../../components/TimetableGrid";

export default function TATimetableEditor() {
  const [branch, setBranch] = useState("CSE");
  const [section, setSection] = useState("A");
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit slot modal
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotDay, setSlotDay] = useState("");
  const [slotPeriod, setSlotPeriod] = useState(1);
  const [slotSubjectId, setSlotSubjectId] = useState("");
  const [slotRoom, setSlotRoom] = useState("LH-101");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/timetable", {
        params: { branch, section, semester: "3" },
      });
      setTimetable(data);
    } catch (err) {
      console.error("Failed to load timetable", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const { data } = await api.get("/subjects");
        setSubjects(data);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [branch, section]);

  const handleEditSlot = (day, period, slot) => {
    setSlotDay(day);
    setSlotPeriod(period);
    setSelectedSlot(slot);
    setSlotSubjectId(slot?.subjectId || (subjects[0]?._id || ""));
    setSlotRoom(slot?.room || "LH-101");
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    setSavingSlot(true);
    try {
      const subj = subjects.find((s) => s._id === slotSubjectId);
      if (selectedSlot?._id) {
        // Update existing
        await api.put(`/timetable/${selectedSlot._id}`, {
          subjectId: slotSubjectId,
          subjectCode: subj?.code || "",
          subjectName: subj?.name || "",
          room: slotRoom,
        });
      } else {
        // Create new
        await api.post("/timetable", {
          branch,
          section,
          semester: "3",
          day: slotDay,
          period: slotPeriod,
          subjectId: slotSubjectId,
          subjectCode: subj?.code || "",
          subjectName: subj?.name || "",
          room: slotRoom,
        });
      }
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err) {
      alert("Error saving timetable slot: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot?._id) return;
    if (!window.confirm("Remove this lecture slot from the timetable?")) return;
    try {
      await api.delete(`/timetable/${selectedSlot._id}`);
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err) {
      alert("Failed to delete slot: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Class Timetable Scheduler</h1>
          <p className="text-xs text-slate mt-0.5">
            Click on any period slot to assign courses, designate lab rooms, or reschedule classes
          </p>
        </div>

        {/* Branch / Section Selectors */}
        <div className="flex items-center gap-2">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink font-semibold outline-none focus:border-emerald"
          >
            <option value="CSE">CSE Department</option>
            <option value="AI_ML">AI & ML Department</option>
            <option value="ECE">ECE Department</option>
            <option value="ME">Mechanical</option>
            <option value="CE">Civil</option>
          </select>

          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink font-semibold outline-none focus:border-emerald"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
            <option value="E">Section E</option>
          </select>
        </div>
      </div>

      {/* Helper notice */}
      <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/20 text-xs text-emerald flex items-center justify-between">
        <span>&bull; Interactive Editor Mode Active: Click any cell below to edit or create an assignment.</span>
        <span className="font-mono text-[11px] font-bold">Semester 3 Schedule</span>
      </div>

      {/* Grid */}
      <TimetableGrid
        entries={timetable}
        highlightToday={true}
        editable={true}
        onEditSlot={handleEditSlot}
      />

      {/* Edit Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-platinum rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-platinum mb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-ink">
                  {selectedSlot ? "Edit Schedule Slot" : "Assign New Lecture Slot"}
                </h3>
                <p className="text-xs text-slate">
                  {slotDay} &bull; Period {slotPeriod} &bull; {branch} Section {section}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full border border-platinum flex items-center justify-center text-slate hover:text-ink hover:bg-paper"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Subject / Course</label>
                <select
                  value={slotSubjectId}
                  onChange={(e) => setSlotSubjectId(e.target.value)}
                  required
                  className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} &mdash; {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Classroom / Lab Venue</label>
                <input
                  type="text"
                  required
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  placeholder="e.g. LH-101, Lab-A, CR-302"
                  className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2 text-xs text-ink outline-none focus:border-emerald focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-platinum">
                {selectedSlot ? (
                  <button
                    type="button"
                    onClick={handleDeleteSlot}
                    className="text-xs font-semibold text-crimson hover:underline"
                  >
                    Remove Slot
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate hover:text-ink hover:bg-paper rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSlot}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald hover:bg-emerald-dark rounded-xl shadow-md shadow-emerald/20 transition-all disabled:opacity-50"
                  >
                    {savingSlot ? "Saving..." : "Save Assignment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
