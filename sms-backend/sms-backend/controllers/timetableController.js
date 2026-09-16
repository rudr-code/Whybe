const Timetable = require("../models/Timetable");
const Subject = require("../models/Subject");

// GET /api/timetable?branch=&section=&semester=
const getTimetable = async (req, res) => {
  try {
    const { branch, section, semester, day } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (section) filter.section = section;
    if (semester) filter.semester = semester;
    if (day) filter.day = day;

    const result = await Timetable.find(filter).lean();

    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };

    result.sort((a, b) => (dayOrder[a.day] - dayOrder[b.day]) || (a.period - b.period));
    return res.json(result);
  } catch (err) {
    console.error("Error in getTimetable:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/timetable/:id
const updateTimetableEntry = async (req, res) => {
  try {
    const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!updated) return res.status(404).json({ message: "Timetable entry not found" });
    return res.json(updated);
  } catch (err) {
    console.error("Error in updateTimetableEntry:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/timetable
const createTimetableEntry = async (req, res) => {
  try {
    const { branch, section, semester, day, period, subjectId, room, facultyId } = req.body;
    if (!branch || !day || !period) {
      return res.status(400).json({ message: "Branch, day, and period are required" });
    }

    let subjectCode = "";
    let subjectName = "";
    if (subjectId) {
      const subj = await Subject.findById(subjectId).lean();
      if (subj) {
        subjectCode = subj.code;
        subjectName = subj.name;
      }
    }

    const entry = await Timetable.create({
      branch,
      section: section || "A",
      semester: semester || "3",
      day,
      period: Number(period),
      subjectId: subjectId || null,
      subjectCode,
      subjectName,
      room: room || "",
      facultyId: facultyId || null,
    });

    return res.status(201).json(entry);
  } catch (err) {
    console.error("Error in createTimetableEntry:", err);
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/timetable/:id
const deleteTimetableEntry = async (req, res) => {
  try {
    const removed = await Timetable.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Timetable entry not found" });
    return res.json({ message: "Timetable entry deleted" });
  } catch (err) {
    console.error("Error in deleteTimetableEntry:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getTimetable, updateTimetableEntry, createTimetableEntry, deleteTimetableEntry };

