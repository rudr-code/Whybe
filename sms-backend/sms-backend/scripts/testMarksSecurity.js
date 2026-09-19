/**
 * testMarksSecurity.js
 * Automated security and contract test suite for the marks feature in Supabase mode.
 * 
 * Usage:
 *   node scripts/testMarksSecurity.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Explicitly ensure Supabase mode for running this security suite against the database
process.env.MARKS_DATA_SOURCE = "supabase";

const marksController = require("../controllers/marksController");
const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");

function createMockReqRes({ user, query = {}, params = {}, body = {} }) {
  let statusCode = 200;
  let responseData = null;

  const req = { user, query, params, body };
  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
  };

  return { req, res, getStatus: () => statusCode, getData: () => responseData };
}

let passed = 0;
let failed = 0;

function assert(description, condition, details = "") {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${description} ${details ? "- " + details : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("Starting Automated Marks Security & Contract Tests");
  console.log("==================================================");

  // -------------------------------------------------------------
  // Step 0: Pre-flight Verification & Row Count Asserts
  // -------------------------------------------------------------
  const enabled = marksController.isSupabaseEnabled();
  console.log(`isSupabaseEnabled: ${enabled}`);
  assert("isSupabaseEnabled() evaluates to true", enabled === true);
  if (!enabled) {
    console.error("Fatal: Supabase data source is not enabled or client not configured.");
    process.exit(1);
  }

  const { count: marksCount, error: mErr } = await supabaseAdmin
    .from("marks")
    .select("id", { count: "exact", head: true });
  const { count: studentsCount, error: sErr } = await supabaseAdmin
    .from("students")
    .select("id", { count: "exact", head: true });
  const { count: subjectsCount, error: subErr } = await supabaseAdmin
    .from("subjects")
    .select("id", { count: "exact", head: true });
  const { count: assignmentsCount, error: aErr } = await supabaseAdmin
    .from("subject_staff_assignments")
    .select("id", { count: "exact", head: true });

  if (mErr || sErr || subErr || aErr) {
    console.error("Database query error during pre-flight check:", mErr || sErr || subErr || aErr);
    process.exit(1);
  }

  console.log(`Live DB Counts: Marks=${marksCount}, Students=${studentsCount}, Subjects=${subjectsCount}, Assignments=${assignmentsCount}`);

  // Tables must not be empty
  const tablesPopulated = (marksCount > 0 && studentsCount > 0 && subjectsCount > 0 && assignmentsCount > 0);
  assert(
    "Supabase tables are populated (marks > 0, students > 0, subjects > 0, assignments > 0)",
    tablesPopulated,
    `Found Marks=${marksCount}, Students=${studentsCount}, Subjects=${subjectsCount}, Assignments=${assignmentsCount}`
  );

  if (!tablesPopulated) {
    console.error("FAIL: Supabase tables are empty! Data migration must be applied before running tests.");
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Test 1: [Negative] Student cannot read another student's marks
  // -------------------------------------------------------------
  {
    const { req, res, getStatus } = createMockReqRes({
      user: { role: "student", studentRef: "student-0001", _id: "user-student-0001" },
      params: { studentId: "student-0002" },
    });

    await marksController.getStudentMarks(req, res);
    assert(
      "Student cannot read another student's marks (GET /api/marks/student/:id)",
      getStatus() === 403,
      `Expected 403, got ${getStatus()}`
    );
  }

  // -------------------------------------------------------------
  // Test 2: [Negative] Student cannot query global marks list (GET /marks)
  // -------------------------------------------------------------
  {
    const { req, res, getStatus } = createMockReqRes({
      user: { role: "student", studentRef: "student-0001", _id: "user-student-0001" },
      query: {},
    });

    await marksController.getMarks(req, res);
    assert(
      "Student gets 403 on global marks list (GET /marks)",
      getStatus() === 403,
      `Expected 403, got ${getStatus()}`
    );
  }

  // -------------------------------------------------------------
  // Test 3: [Negative] Student cannot view course marks list (GET /marks/subject/:id)
  // -------------------------------------------------------------
  {
    const { req, res, getStatus } = createMockReqRes({
      user: { role: "student", studentRef: "student-0001", _id: "user-student-0001" },
      params: { subjectId: "subject-001" },
    });

    await marksController.getSubjectMarks(req, res);
    assert(
      "Student gets 403 on subject marks list (GET /marks/subject/:id)",
      getStatus() === 403,
      `Expected 403, got ${getStatus()}`
    );
  }

  // -------------------------------------------------------------
  // Test 4: [Negative] Faculty gets 403 for another faculty's unassigned subject
  // -------------------------------------------------------------
  {
    // Prof. Sunita Sharma (user-faculty-001) assigned to subject-001, 003, 005
    // Attempting to write marks for subject-002 (Prof. Mehta)
    const { req, res, getStatus } = createMockReqRes({
      user: { _id: "user-faculty-001", id: "user-faculty-001", role: "faculty" },
      body: {
        studentId: "student-0001",
        subjectId: "subject-002",
        midSem1: 20,
      },
    });

    await marksController.upsertMarks(req, res);
    assert(
      "Faculty gets 403 when attempting to write another faculty's subject",
      getStatus() === 403,
      `Expected 403, got ${getStatus()}`
    );
  }

  // -------------------------------------------------------------
  // Test 5: [Safety] Injection-style studentId returns no data even for admin
  // -------------------------------------------------------------
  {
    const maliciousId = "x,student_id.neq.0";
    const { req, res, getStatus, getData } = createMockReqRes({
      user: { _id: "user-admin-001", role: "admin" },
      params: { studentId: maliciousId },
    });

    await marksController.getStudentMarks(req, res);
    const data = getData();
    const isSafe = Array.isArray(data) && data.length === 0;
    assert(
      'Injection-style studentId ("x,student_id.neq.0") returns empty data for admin without leaking',
      isSafe,
      `Got status ${getStatus()}, length: ${Array.isArray(data) ? data.length : 0}`
    );
  }

  // -------------------------------------------------------------
  // Test 6: [Positive] Student reads own marks (exactly 6 rows returned)
  // -------------------------------------------------------------
  {
    const { req, res, getStatus, getData } = createMockReqRes({
      user: { role: "student", studentRef: "student-0001", _id: "user-student-0001" },
      params: { studentId: "student-0001" },
    });

    await marksController.getStudentMarks(req, res);
    const marks = getData();
    assert(
      "Student successfully reads own marks (HTTP 200, exactly 6 rows for student-0001)",
      getStatus() === 200 && Array.isArray(marks) && marks.length === 6,
      `Status: ${getStatus()}, rows: ${Array.isArray(marks) ? marks.length : 0}`
    );
  }

  // -------------------------------------------------------------
  // Test 7: [Positive] Admin reads student-0001 marks (6 rows)
  // -------------------------------------------------------------
  {
    const { req, res, getStatus, getData } = createMockReqRes({
      user: { _id: "user-admin-001", role: "admin" },
      params: { studentId: "student-0001" },
    });

    await marksController.getStudentMarks(req, res);
    const marks = getData();
    assert(
      "Admin successfully reads student-0001 marks (HTTP 200, 6 rows)",
      getStatus() === 200 && Array.isArray(marks) && marks.length === 6,
      `Status: ${getStatus()}, rows: ${Array.isArray(marks) ? marks.length : 0}`
    );
  }

  // -------------------------------------------------------------
  // Test 8 & 9: [Positive + Safety] TA write & Partial update on test student with full restoration
  // -------------------------------------------------------------
  {
    const TEST_STUDENT_LEGACY_ID = "student-sec-test-temp";
    let testStudentDbId = null;

    try {
      // 1. Insert dedicated temporary test student (never touches real data)
      const { data: createdStudent, error: insertStuErr } = await supabaseAdmin
        .from("students")
        .insert({
          legacy_id: TEST_STUDENT_LEGACY_ID,
          name: "Security Test Student",
          roll_no: "SEC-TEST-999",
          branch: "CSE",
          section: "A",
          semester: "3",
        })
        .select("id, legacy_id")
        .single();

      if (insertStuErr) {
        throw new Error(`Failed to create test student: ${insertStuErr.message}`);
      }
      testStudentDbId = createdStudent.id;

      // 2. TA writes marks for assigned subject (subject-001) using legacy IDs
      const { req: writeReq, res: writeRes, getStatus: writeStatus, getData: writeData } = createMockReqRes({
        user: { _id: "user-ta-001", id: "user-ta-001", role: "ta" },
        body: {
          studentId: TEST_STUDENT_LEGACY_ID,
          subjectId: "subject-001",
          midSem1: 20,
          midSem2: 20,
          endSem: 35,
          internal: 9,
        },
      });

      await marksController.upsertMarks(writeReq, writeRes);
      const initialWrite = writeData();
      assert(
        "TA can write marks using legacy IDs for assigned subject on test student (HTTP 201, total 84, grade A)",
        writeStatus() === 201 && initialWrite && initialWrite.total === 84 && initialWrite.grade === "A",
        `Status: ${writeStatus()}, data: ${JSON.stringify(initialWrite)}`
      );

      // 3. Partial update: submitting only midSem1 preserves midSem2, endSem, internal
      const { req: partialReq, res: partialRes, getStatus: partialStatus, getData: partialData } = createMockReqRes({
        user: { _id: "user-ta-001", id: "user-ta-001", role: "ta" },
        body: {
          studentId: TEST_STUDENT_LEGACY_ID,
          subjectId: "subject-001",
          midSem1: 24, // updating only midSem1 (20 -> 24)
        },
      });

      await marksController.upsertMarks(partialReq, partialRes);
      const partialResult = partialData();
      const mid2Preserved = partialResult?.midSem2 === 20;
      const endPreserved = partialResult?.endSem === 35;
      const internalPreserved = partialResult?.internal === 9;
      const totalRecomputed = partialResult?.total === 88; // 24 + 20 + 35 + 9
      const gradeRecomputed = partialResult?.grade === "A";

      assert(
        "Partial update merges with existing row and preserves untouched fields (mid2, end, internal preserved, total=88)",
        partialStatus() === 201 && mid2Preserved && endPreserved && internalPreserved && totalRecomputed && gradeRecomputed,
        `Preserved: mid2=${mid2Preserved}, end=${endPreserved}, internal=${internalPreserved}, total=${totalRecomputed}`
      );
    } finally {
      // 4. Restore original state: clean up test student and test mark
      if (testStudentDbId) {
        await supabaseAdmin.from("marks").delete().eq("student_id", testStudentDbId);
        await supabaseAdmin.from("students").delete().eq("id", testStudentDbId);
        console.log(`[CLEANUP] Restored database state: temporary test student and marks deleted.`);
      }
    }
  }

  console.log("==================================================");
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed.`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
