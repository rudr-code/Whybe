const Subject = require("../models/Subject");
const User = require("../models/User");

// GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    const { branch, semester } = req.query;
    const filter = {};
    if (branch) {
      filter.$or = [{ branch }, { branch: "ALL" }];
    }
    if (semester) {
      filter.semester = semester;
    }
    const result = await Subject.find(filter).lean();
    return res.json(result);
  } catch (err) {
    console.error("Error in getSubjects:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/subjects/:id
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).lean();
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    let facultyName = "Unassigned";
    if (subject.facultyId) {
      const faculty = await User.findById(subject.facultyId).lean();
      if (faculty) facultyName = faculty.name;
    }

    return res.json({ ...subject, facultyName });
  } catch (err) {
    console.error("Error in getSubjectById:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/subjects
const createSubject = async (req, res) => {
  try {
    const { code, name, branch, semester, credits, facultyId } = req.body;
    if (!code || !name) {
      return res.status(400).json({ message: "Code and name are required" });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Subject.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: "Subject with this code already exists" });
    }

    const subject = await Subject.create({
      code: cleanCode,
      name,
      branch: branch || "ALL",
      semester: semester || "3",
      credits: credits || 3,
      facultyId: facultyId || null,
    });

    return res.status(201).json(subject);
  } catch (err) {
    console.error("Error in createSubject:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!updated) return res.status(404).json({ message: "Subject not found" });
    return res.json(updated);
  } catch (err) {
    console.error("Error in updateSubject:", err);
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const removed = await Subject.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Subject not found" });
    return res.json({ message: "Subject deleted" });
  } catch (err) {
    console.error("Error in deleteSubject:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };

