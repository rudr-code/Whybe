export default function TimetableGrid({
  entries = [],
  highlightToday = true,
  editable = false,
  onEditSlot = null,
}) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const getSlot = (day, period) => {
    return entries.find((e) => e.day === day && Number(e.period) === Number(period));
  };

  const getSubjectColor = (code) => {
    if (!code) return "bg-paper text-slate border-platinum";
    const charCode = code.charCodeAt(0) + code.charCodeAt(code.length - 1);
    const variants = [
      "bg-emerald/10 text-emerald-dark border-emerald/30",
      "bg-crimson/10 text-crimson border-crimson/30",
      "bg-jet/5 text-ink border-platinum",
      "bg-emerald/15 text-emerald border-emerald/40",
      "bg-platinum/50 text-slate border-platinum",
    ];
    return variants[charCode % variants.length];
  };

  return (
    <div className="overflow-x-auto border border-platinum rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[700px] border-collapse text-xs">
        <thead>
          <tr className="bg-paper border-b border-platinum">
            <th className="py-3 px-3 text-left font-bold text-slate uppercase tracking-wider w-24 border-r border-platinum">
              Day / Period
            </th>
            {periods.map((p) => (
              <th key={p} className="py-3 px-2 text-center font-bold text-ink border-r border-platinum/60 last:border-r-0">
                P{p}
                <span className="block text-[10px] font-normal text-slate">
                  {p === 1 && "09:00"}
                  {p === 2 && "10:00"}
                  {p === 3 && "11:00"}
                  {p === 4 && "12:00"}
                  {p === 5 && "01:30"}
                  {p === 6 && "02:30"}
                  {p === 7 && "03:30"}
                  {p === 8 && "04:30"}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-platinum">
          {days.map((day) => {
            const isToday = highlightToday && day.toLowerCase() === currentDayName.toLowerCase();
            return (
              <tr key={day} className={`transition-colors ${isToday ? "bg-emerald/5" : "hover:bg-paper/40"}`}>
                <td className="py-3 px-3 font-bold text-ink border-r border-platinum whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {isToday && <span className="w-2 h-2 rounded-full bg-emerald shrink-0" />}
                    <span className={isToday ? "text-emerald font-extrabold" : ""}>{day}</span>
                  </div>
                  {isToday && (
                    <span className="text-[10px] text-emerald font-semibold uppercase tracking-wider block">
                      Today
                    </span>
                  )}
                </td>

                {periods.map((period) => {
                  const slot = getSlot(day, period);
                  const isHalfDaySat = day === "Saturday" && period > 4;

                  if (isHalfDaySat) {
                    return (
                      <td key={period} className="py-2 px-1 text-center bg-paper/60 border-r border-platinum/40 text-slate/40 text-[10px]">
                        &mdash;
                      </td>
                    );
                  }

                  return (
                    <td
                      key={period}
                      onClick={() => editable && onEditSlot && onEditSlot(day, period, slot)}
                      className={`py-2 px-1.5 text-center border-r border-platinum/60 last:border-r-0 align-top ${
                        editable ? "cursor-pointer hover:bg-emerald/10" : ""
                      }`}
                    >
                      {slot ? (
                        <div className={`p-2 rounded-xl border text-left transition-transform hover:scale-[1.02] ${getSubjectColor(slot.subjectCode)}`}>
                          <div className="font-bold truncate text-[11px]">
                            {slot.subjectCode || "SUB"}
                          </div>
                          <div className="text-[10px] text-slate truncate">
                            {slot.subjectName || "Subject"}
                          </div>
                          {slot.room && (
                            <div className="text-[9px] font-mono text-slate/80 mt-1 flex items-center gap-1">
                              <span>📍</span>
                              <span className="truncate">{slot.room}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-14 rounded-xl border border-dashed border-platinum/70 flex items-center justify-center text-[10px] text-slate/40">
                          {editable ? "+ Add" : "Free"}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
