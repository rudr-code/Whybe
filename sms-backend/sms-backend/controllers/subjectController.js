const dataStore = require("../dataStore");

// GET /api/subjects
const getSubjects = (req, res) => {
  const { branch, semester } = req.query;
  let result = [...dataStore.subjects];
  if (branch) result = result.filter(s => s.branch === branch || s.branch === "ALL");
  if (semester) result = result.filter(s => s.semester === semester);
  res.json(result);
};

// GET /api/subjects/:id
const getSubjectById = (req, res) => {
  const subject = dataStore.findById("subjects", req.params.id);
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  const faculty = dataStore.findById("users", subject.facultyId);
  res.json({ ...subject, facultyName: faculty?.name || "Unassigned" });
};

// POST /api/subjects
const createSubject = (req, res) => {
  const { code, name, branch, semester, credits, facultyId } = req.body;
  if (!code || !name) return res.status(400).json({ message: "Code and name are required" });
  const existing = dataStore.findOne("subjects", { code });
  if (existing) return res.status(400).json({ message: "Subject with this code already exists" });
  const subject = dataStore.insert("subjects", {
    code, name, branch: branch || "ALL", semester: semester || "3",
    credits: credits || 3, facultyId: facultyId || null,
  });
  res.status(201).json(subject);
};

// PUT /api/subjects/:id
const updateSubject = (req, res) => {
  const updated = dataStore.update("subjects", req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Subject not found" });
  res.json(updated);
};

// DELETE /api/subjects/:id
const deleteSubject = (req, res) => {
  const removed = dataStore.remove("subjects", req.params.id);
  if (!removed) return res.status(404).json({ message: "Subject not found" });
  res.json({ message: "Subject deleted" });
};

module.exports = { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };
