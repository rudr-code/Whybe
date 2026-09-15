const dataStore = require("../dataStore");

// GET /api/timetable?branch=&section=&semester=
const getTimetable = (req, res) => {
  const { branch, section, semester, day } = req.query;
  let result = [...dataStore.timetable];
  if (branch) result = result.filter(t => t.branch === branch);
  if (section) result = result.filter(t => t.section === section);
  if (semester) result = result.filter(t => t.semester === semester);
  if (day) result = result.filter(t => t.day === day);
  // Sort by day order then period
  const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
  result.sort((a, b) => (dayOrder[a.day] - dayOrder[b.day]) || (a.period - b.period));
  res.json(result);
};

// PUT /api/timetable/:id
const updateTimetableEntry = (req, res) => {
  const updated = dataStore.update("timetable", req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Timetable entry not found" });
  res.json(updated);
};

// POST /api/timetable
const createTimetableEntry = (req, res) => {
  const { branch, section, semester, day, period, subjectId, room, facultyId } = req.body;
  if (!branch || !day || !period) return res.status(400).json({ message: "Branch, day, and period are required" });
  const subj = dataStore.findById("subjects", subjectId);
  const entry = dataStore.insert("timetable", {
    branch, section: section || "A", semester: semester || "3", day, period,
    subjectId: subjectId || null, subjectCode: subj?.code || "", subjectName: subj?.name || "",
    room: room || "", facultyId: facultyId || null,
  });
  res.status(201).json(entry);
};

// DELETE /api/timetable/:id
const deleteTimetableEntry = (req, res) => {
  const removed = dataStore.remove("timetable", req.params.id);
  if (!removed) return res.status(404).json({ message: "Timetable entry not found" });
  res.json({ message: "Timetable entry deleted" });
};

module.exports = { getTimetable, updateTimetableEntry, createTimetableEntry, deleteTimetableEntry };
