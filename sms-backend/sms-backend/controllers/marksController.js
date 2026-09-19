const dataStore = require("../dataStore");
const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");

const isSupabaseEnabled = () =>
  process.env.MARKS_DATA_SOURCE === "supabase" && isSupabaseConfigured && supabaseAdmin !== null;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (val) => typeof val === "string" && UUID_REGEX.test(val.trim());

// Safe resolver: returns { column: 'id' | 'legacy_id', value } for .eq() queries without .or() string interpolation
const resolveId = (val) => {
  const clean = String(val || "").trim();
  return isUuid(clean) ? { column: "id", value: clean } : { column: "legacy_id", value: clean };
};
const resolveIdCriteria = resolveId;

// Helper: map Supabase marks row to API contract format
const formatMarkRow = (row) => ({
  _id: row.legacy_id || row.id,
  id: row.id,
  studentId: row.students?.legacy_id || row.student_id,
  subjectId: row.subjects?.legacy_id || row.subject_id,
  subjectCode: row.subjects?.code || row.subjectCode || "",
  subjectName: row.subjects?.name || row.subjectName || "",
  midSem1: Number(row.mid_sem_1 ?? 0),
  midSem2: Number(row.mid_sem_2 ?? 0),
  endSem: Number(row.end_sem ?? 0),
  internal: Number(row.internal ?? 0),
  total: Number(row.total ?? 0),
  grade: row.grade || "F",
  semester: row.semester || "3",
  studentName: row.students?.name,
  rollNo: row.students?.roll_no,
  branch: row.students?.branch,
  section: row.students?.section,
});

// Helper: safely resolve student database record
async function resolveStudent(identifier) {
  if (!identifier) return null;
  const crit = resolveIdCriteria(identifier);
  const { data, error } = await supabaseAdmin
    .from("students")
    .select("id, legacy_id, name, roll_no, branch, section")
    .eq(crit.column, crit.value)
    .maybeSingle();

  return (!error && data) ? data : null;
}

// Helper: safely resolve subject database record
async function resolveSubject(identifier) {
  if (!identifier) return null;
  const crit = resolveIdCriteria(identifier);
  const { data, error } = await supabaseAdmin
    .from("subjects")
    .select("id, legacy_id, code, name")
    .eq(crit.column, crit.value)
    .maybeSingle();

  return (!error && data) ? data : null;
}

// Helper: check if staff user is authorized to read/write marks for a subject
async function checkStaffSubjectAuthorization(user, subjectIdParam) {
  if (!user) return false;
  const role = user.role;
  if (role === "admin" || role === "exam_cell") return true;
  if (role !== "faculty" && role !== "ta") return false;

  if (!isSupabaseEnabled()) {
    if (role === "ta") return true; // Option 1: TA allowed on all subjects
    if (role === "faculty") {
      const dsSubj = dataStore.findById("subjects", subjectIdParam) ||
                     dataStore.findOne("subjects", { code: subjectIdParam });
      return Boolean(dsSubj && dsSubj.facultyId === (user._id || user.id));
    }
    return false;
  }

  const subject = await resolveSubject(subjectIdParam);
  if (!subject) return false;

  // Resolve staff profile
  const staffCrit = resolveIdCriteria(user._id || user.id);
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq(staffCrit.column, staffCrit.value)
    .maybeSingle();

  if (!profile) return false;

  const { data: assignment } = await supabaseAdmin
    .from("subject_staff_assignments")
    .select("id")
    .eq("subject_id", subject.id)
    .eq("staff_id", profile.id)
    .maybeSingle();

  return Boolean(assignment);
}

// Helper: get list of subject UUIDs assigned to staff
async function getAssignedSubjectIds(user) {
  if (!user) return [];
  if (user.role === "admin" || user.role === "exam_cell") return null; // all
  const staffCrit = resolveIdCriteria(user._id || user.id);
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq(staffCrit.column, staffCrit.value)
    .maybeSingle();

  if (!profile) return [];

  const { data: assignments } = await supabaseAdmin
    .from("subject_staff_assignments")
    .select("subject_id")
    .eq("staff_id", profile.id);

  return (assignments || []).map(a => a.subject_id);
}

// GET /api/marks?studentId=&subjectId=&semester=
const getMarks = async (req, res) => {
  // Read Authorization: Students are forbidden from global marks queries
  if (req.user?.role === "student") {
    return res.status(403).json({ message: "Students are not permitted to query global marks list" });
  }

  if (!isSupabaseEnabled()) {
    const { studentId, subjectId, semester } = req.query;
    let result = [...dataStore.marks];
    if (studentId) result = result.filter(m => m.studentId === studentId);
    if (subjectId) result = result.filter(m => m.subjectId === subjectId);
    if (semester) result = result.filter(m => m.semester === semester);
    return res.json(result);
  }

  try {
    const { studentId, subjectId, semester, page = 1, limit = 1000 } = req.query;

    // Faculty & TA authorization: must only read assigned subjects
    if (req.user?.role === "faculty" || req.user?.role === "ta") {
      if (subjectId) {
        const isAllowed = await checkStaffSubjectAuthorization(req.user, subjectId);
        if (!isAllowed) {
          return res.status(403).json({ message: "You are not assigned to instruct or view this subject" });
        }
      }
    }

    let query = supabaseAdmin
      .from("marks")
      .select("*, students!inner(id, legacy_id, name, roll_no, branch, section), subjects!inner(id, legacy_id, code, name)");

    if (studentId) {
      const student = await resolveStudent(studentId);
      if (!student) return res.json([]);
      query = query.eq("student_id", student.id);
    }

    if (subjectId) {
      const subject = await resolveSubject(subjectId);
      if (!subject) return res.json([]);
      query = query.eq("subject_id", subject.id);
    } else if (req.user?.role === "faculty" || req.user?.role === "ta") {
      const allowedSubjectIds = await getAssignedSubjectIds(req.user);
      if (allowedSubjectIds.length === 0) return res.json([]);
      query = query.in("subject_id", allowedSubjectIds);
    }

    if (semester) {
      query = query.eq("semester", semester);
    }

    const start = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const { data, error } = await query
      .order("created_at", { ascending: true })
      .range(start, start + parseInt(limit, 10) - 1);

    if (error) throw error;
    return res.json(data.map(formatMarkRow));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/marks/student/:studentId
const getStudentMarks = async (req, res) => {
  const targetStudentId = req.params.studentId;

  // Read Authorization: Students can ONLY view their own marks
  if (req.user?.role === "student") {
    const callerStudentRef = req.user.studentRef;
    if (!callerStudentRef || (targetStudentId !== callerStudentRef && targetStudentId !== req.user.id && targetStudentId !== req.user._id)) {
      return res.status(403).json({ message: "Students may only view their own marks" });
    }
  }

  if (!isSupabaseEnabled()) {
    const result = dataStore.findByField("marks", "studentId", targetStudentId);
    return res.json(result);
  }

  try {
    const student = await resolveStudent(targetStudentId);
    if (!student) return res.json([]);

    let query = supabaseAdmin
      .from("marks")
      .select("*, students!inner(id, legacy_id), subjects!inner(id, legacy_id, code, name)")
      .eq("student_id", student.id);

    // If faculty/ta, only show marks for assigned subjects
    if (req.user?.role === "faculty" || req.user?.role === "ta") {
      const allowedSubjectIds = await getAssignedSubjectIds(req.user);
      if (allowedSubjectIds.length === 0) return res.json([]);
      query = query.in("subject_id", allowedSubjectIds);
    }

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;

    res.json(data.map(formatMarkRow));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/marks/subject/:subjectId — all students' marks for a subject
const getSubjectMarks = async (req, res) => {
  // Read Authorization: Students are forbidden from viewing full class subject marks
  if (req.user?.role === "student") {
    return res.status(403).json({ message: "Students are not permitted to view course marks lists" });
  }

  const subjParam = req.params.subjectId;
  const { page = 1, limit = 50 } = req.query;

  // Faculty and TA authorization for this subject
  if (req.user?.role === "faculty" || req.user?.role === "ta") {
    try {
      const isAllowed = await checkStaffSubjectAuthorization(req.user, subjParam);
      if (!isAllowed) {
        return res.status(403).json({ message: "You are not assigned to instruct or view this subject" });
      }
    } catch (authErr) {
      console.error("Authorization check error in getSubjectMarks:", authErr);
      return res.status(500).json({ message: "Authorization check error" });
    }
  }

  if (!isSupabaseEnabled()) {
    const all = dataStore.findByField("marks", "subjectId", subjParam);
    const enriched = all.map(m => {
      const student = dataStore.findById("students", m.studentId);
      return { ...m, studentName: student?.name, rollNo: student?.rollNo, branch: student?.branch, section: student?.section };
    });
    const start = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const paginated = enriched.slice(start, start + parseInt(limit, 10));
    return res.json({ marks: paginated, total: enriched.length, page: parseInt(page, 10), totalPages: Math.ceil(enriched.length / parseInt(limit, 10)) });
  }

  try {
    const subject = await resolveSubject(subjParam);
    if (!subject) {
      return res.json({ marks: [], total: 0, page: parseInt(page, 10), totalPages: 0 });
    }

    const p = parseInt(page, 10) || 1;
    const l = parseInt(limit, 10) || 50;
    const start = (p - 1) * l;

    const { data, error, count } = await supabaseAdmin
      .from("marks")
      .select("*, students!inner(id, legacy_id, name, roll_no, branch, section), subjects!inner(id, legacy_id, code, name)", { count: "exact" })
      .eq("subject_id", subject.id)
      .order("created_at", { ascending: true })
      .range(start, start + l - 1);

    if (error) throw error;

    const marks = data.map(formatMarkRow);
    res.json({ marks, total: count || marks.length, page: p, totalPages: Math.ceil((count || marks.length) / l) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/marks — create or update marks (merges omitted fields with existing record)
const upsertMarks = async (req, res) => {
  const { studentId, subjectId, midSem1, midSem2, endSem, internal, semester } = req.body;
  if (!studentId || !subjectId) return res.status(400).json({ message: "studentId and subjectId are required" });

  // 1. Enforce subject staff assignment authorization in backend write path
  try {
    const isAuthorized = await checkStaffSubjectAuthorization(req.user, subjectId);
    if (!isAuthorized) {
      return res.status(403).json({ message: "You are not assigned to instruct or grade this subject" });
    }
  } catch (authErr) {
    console.error("Authorization check error in upsertMarks:", authErr);
    return res.status(500).json({ message: "Authorization check error" });
  }

  if (!isSupabaseEnabled()) {
    const existing = dataStore.marks.find(m => m.studentId === studentId && m.subjectId === subjectId);
    const subj = dataStore.findById("subjects", subjectId);
    const total = (midSem1 ?? existing?.midSem1 ?? 0) +
                  (midSem2 ?? existing?.midSem2 ?? 0) +
                  (endSem ?? existing?.endSem ?? 0) +
                  (internal ?? existing?.internal ?? 0);
    const grade = calcGrade(total);

    if (existing) {
      const updated = dataStore.update("marks", existing._id, {
        midSem1: midSem1 ?? existing.midSem1,
        midSem2: midSem2 ?? existing.midSem2,
        endSem: endSem ?? existing.endSem,
        internal: internal ?? existing.internal,
        total,
        grade,
        semester: semester || existing.semester,
      });
      return res.json(updated);
    }

    const mark = dataStore.insert("marks", {
      studentId, subjectId, subjectCode: subj?.code || "", subjectName: subj?.name || "",
      midSem1: midSem1 || 0, midSem2: midSem2 || 0, endSem: endSem || 0, internal: internal || 0,
      total, grade, semester: semester || "3",
    });
    return res.status(201).json(mark);
  }

  try {
    // 2. Safely resolve student and subject records using exact .eq() criteria
    const student = await resolveStudent(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const subject = await resolveSubject(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // 3. Fetch existing mark to merge omitted fields so partial updates preserve old values
    const { data: existingMark } = await supabaseAdmin
      .from("marks")
      .select("*")
      .eq("student_id", student.id)
      .eq("subject_id", subject.id)
      .maybeSingle();

    const mergedPayload = {
      student_id: student.id,
      subject_id: subject.id,
      semester: semester || existingMark?.semester || "3",
      mid_sem_1: midSem1 !== undefined ? Number(midSem1) : (existingMark?.mid_sem_1 ?? 0),
      mid_sem_2: midSem2 !== undefined ? Number(midSem2) : (existingMark?.mid_sem_2 ?? 0),
      end_sem: endSem !== undefined ? Number(endSem) : (existingMark?.end_sem ?? 0),
      internal: internal !== undefined ? Number(internal) : (existingMark?.internal ?? 0),
    };

    // 4. Upsert into Supabase (trigger computes total and grade)
    const { data: upserted, error } = await supabaseAdmin
      .from("marks")
      .upsert(mergedPayload, { onConflict: "student_id,subject_id" })
      .select("*, students(id, legacy_id, name, roll_no, branch, section), subjects(id, legacy_id, code, name)")
      .single();

    if (error) throw error;
    res.status(201).json(formatMarkRow(upserted));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/marks/:id — update specific marks record
const updateMarks = async (req, res) => {
  const markId = req.params.id;

  if (!isSupabaseEnabled()) {
    const existing = dataStore.findById("marks", markId);
    if (!existing) return res.status(404).json({ message: "Marks record not found" });

    const midSem1 = req.body.midSem1 ?? existing.midSem1;
    const midSem2 = req.body.midSem2 ?? existing.midSem2;
    const endSem = req.body.endSem ?? existing.endSem;
    const internal = req.body.internal ?? existing.internal;
    const total = midSem1 + midSem2 + endSem + internal;

    const updated = dataStore.update("marks", markId, {
      ...req.body, midSem1, midSem2, endSem, internal, total, grade: calcGrade(total),
    });
    return res.json(updated);
  }

  try {
    const crit = resolveIdCriteria(markId);
    const { data: existing, error: findErr } = await supabaseAdmin
      .from("marks")
      .select("*, subjects(id, legacy_id)")
      .eq(crit.column, crit.value)
      .maybeSingle();

    if (findErr || !existing) return res.status(404).json({ message: "Marks record not found" });

    // Enforce subject staff assignment authorization
    const isAuthorized = await checkStaffSubjectAuthorization(req.user, existing.subject_id);
    if (!isAuthorized) {
      return res.status(403).json({ message: "You are not assigned to instruct or grade this subject" });
    }

    const updates = {};
    if (req.body.midSem1 !== undefined) updates.mid_sem_1 = Number(req.body.midSem1);
    if (req.body.midSem2 !== undefined) updates.mid_sem_2 = Number(req.body.midSem2);
    if (req.body.endSem !== undefined) updates.end_sem = Number(req.body.endSem);
    if (req.body.internal !== undefined) updates.internal = Number(req.body.internal);

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("marks")
      .update(updates)
      .eq("id", existing.id)
      .select("*, students(id, legacy_id, name, roll_no, branch, section), subjects(id, legacy_id, code, name)")
      .single();

    if (updateErr) throw updateErr;
    res.json(formatMarkRow(updated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function calcGrade(total) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B+";
  if (total >= 60) return "B";
  if (total >= 50) return "C+";
  if (total >= 40) return "C";
  if (total >= 30) return "D";
  return "F";
}

module.exports = {
  getMarks,
  getStudentMarks,
  getSubjectMarks,
  upsertMarks,
  updateMarks,
  isSupabaseEnabled,
  resolveId,
  resolveIdCriteria,
};
