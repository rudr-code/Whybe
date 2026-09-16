import { useState, useEffect } from "react";
import api from "../../api/axios";
import TimetableGrid from "../../components/TimetableGrid";

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchTimetable(isBackground = false) {
      try {
        if (!isBackground) setLoading(true);
        const { data } = await api.get("/timetable", {
          params: { branch: "CSE", section: "A" },
        });
        if (isMounted) setTimetable(data);
      } catch (err) {
        console.error("Failed to load timetable", err);
      } finally {
        if (isMounted && !isBackground) setLoading(false);
      }
    }

    fetchTimetable(false);

    const interval = setInterval(() => {
      fetchTimetable(true);
    }, 10000);

    const onFocus = () => {
      if (document.visibilityState === "visible") {
        fetchTimetable(true);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Class Schedule & Timetable</h1>
          <p className="text-xs text-slate mt-0.5">
            Department of Computer Science & Engineering &bull; Section A &bull; Semester 3
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-platinum text-ink">
            Batch: 2024–2028
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald/10 text-emerald border border-emerald/20">
            Room: LH-101 / Lab-A
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate">Loading class schedule...</div>
      ) : (
        <TimetableGrid entries={timetable} highlightToday={true} editable={false} />
      )}

      {/* Timetable Period Legend */}
      <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate mb-3">
          Daily Schedule Timings
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { p: "Period 1", time: "09:00 - 10:00 AM" },
            { p: "Period 2", time: "10:00 - 11:00 AM" },
            { p: "Period 3", time: "11:00 - 12:00 PM" },
            { p: "Period 4", time: "12:00 - 01:00 PM" },
            { p: "Lunch Break", time: "01:00 - 01:30 PM", break: true },
            { p: "Period 5", time: "01:30 - 02:30 PM" },
            { p: "Period 6", time: "02:30 - 03:30 PM" },
            { p: "Period 7", time: "03:30 - 04:30 PM" },
          ].map((slot) => (
            <div
              key={slot.p}
              className={`p-2.5 rounded-xl border ${
                slot.break ? "bg-amber-500/10 border-amber-500/30 text-amber-700" : "bg-paper border-platinum"
              }`}
            >
              <div className="font-bold">{slot.p}</div>
              <div className="text-[10px] text-slate font-mono mt-0.5">{slot.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
