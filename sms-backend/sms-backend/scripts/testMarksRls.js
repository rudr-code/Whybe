/**
 * testMarksRls.js
 * End-to-end Row Level Security (RLS) and Column Privilege verification script.
 * Uses real authenticated sessions via the Supabase anon key client (no mock users).
 * 
 * NOTE: Must only be run after database migration and data import are completed.
 * 
 * Usage:
 *   node scripts/testMarksRls.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) must be set in backend .env to run RLS tests.");
  process.exit(1);
}

// Client for unauthenticated and user session testing
function createAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Admin client for test fixture setup & cleanup
const adminClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

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

async function runRlsTests() {
  console.log("==================================================");
  console.log("Starting Live Supabase RLS & Column Privilege Tests");
  console.log("==================================================");

  // -------------------------------------------------------------
  // Test Suite 1: Anonymous Client (No Session)
  // -------------------------------------------------------------
  console.log("\n--- Suite 1: Anonymous Client Lockout (REVOKE ALL FROM anon) ---");
  const anon = createAnonClient();

  const tables = ["marks", "profiles", "students", "subjects", "subject_staff_assignments"];
  for (const table of tables) {
    const { data, error } = await anon.from(table).select("*");
    const isLocked = (!data || data.length === 0) || Boolean(error);
    assert(
      `Anon client gets zero rows on public.${table}`,
      isLocked,
      `Returned rows: ${data ? data.length : 0}, error: ${error?.message}`
    );
  }

  // -------------------------------------------------------------
  // Test Suite 2: Student Session (Aarav Sharma)
  // -------------------------------------------------------------
  console.log("\n--- Suite 2: Student RLS Isolation (Aarav Sharma) ---");
  const studentClient = createAnonClient();

  const { data: authData, error: loginErr } = await studentClient.auth.signInWithPassword({
    email: "aarav.sharma@campussync.edu",
    password: "2005-03-15",
  });

  if (loginErr || !authData?.user) {
    console.error("Failed to sign in student user Aarav Sharma:", loginErr?.message);
    process.exit(1);
  }

  const aaravAuthId = authData.user.id;

  // Resolve Aarav's student record ID
  const { data: aaravStudent } = await studentClient
    .from("students")
    .select("id, legacy_id")
    .eq("profile_id", aaravAuthId)
    .single();

  assert("Aarav's profile is linked to a student record", Boolean(aaravStudent?.id));

  if (aaravStudent) {
    // 1. Aarav reads marks: exactly his 6 rows, none for any other student
    const { data: myMarks, error: mErr } = await studentClient.from("marks").select("*");
    assert(
      "Aarav reads exactly his 6 marks rows",
      !mErr && Array.isArray(myMarks) && myMarks.length === 6,
      `Received count: ${myMarks?.length}, error: ${mErr?.message}`
    );

    const allBelongToAarav = (myMarks || []).every(m => m.student_id === aaravStudent.id);
    assert("All returned marks rows belong to Aarav's student_id", allBelongToAarav);

    // 2. Aarav cannot read profiles of others
    const { data: profiles, error: pErr } = await studentClient.from("profiles").select("id, email");
    const onlyOwnProfile = Array.isArray(profiles) && profiles.length === 1 && profiles[0].id === aaravAuthId;
    assert(
      "Aarav cannot read profiles of other users (sees only own profile)",
      onlyOwnProfile,
      `Profiles returned: ${profiles?.length}`
    );

    // 3. Aarav cannot UPDATE marks (students have no update privilege)
    if (myMarks && myMarks.length > 0) {
      const targetMarkId = myMarks[0].id;
      const { data: updateRes, error: uErr } = await studentClient
        .from("marks")
        .update({ mid_sem_1: 25 })
        .eq("id", targetMarkId)
        .select();

      const updateBlocked = Boolean(uErr) || (!updateRes || updateRes.length === 0);
      assert(
        "Aarav cannot UPDATE marks records (RLS rejects update)",
        updateBlocked,
        `Update returned rows: ${updateRes?.length}, error: ${uErr?.message}`
      );
    }
  }

  await studentClient.auth.signOut();

  // -------------------------------------------------------------
  // Test Suite 3: TA Session (Priya Desai) & Column Privileges
  // -------------------------------------------------------------
  console.log("\n--- Suite 3: TA Permissions & Column Privileges (Priya Desai) ---");
  if (!adminClient) {
    console.error("Admin client unavailable; skipping temporary test fixture creation.");
    process.exit(1);
  }

  const TEMP_STUDENT_LEGACY = "student-rls-test-temp";
  let tempStudentDbId = null;
  let tempMarkDbId = null;

  try {
    // 1. Setup: Admin creates temporary test student
    const { data: createdStudent, error: sErr } = await adminClient
      .from("students")
      .insert({
        legacy_id: TEMP_STUDENT_LEGACY,
        name: "RLS Test Temp Student",
        roll_no: "RLS-TEMP-001",
        branch: "CSE",
        section: "A",
        semester: "3",
      })
      .select("id, legacy_id")
      .single();

    if (sErr) throw sErr;
    tempStudentDbId = createdStudent.id;

    // Resolve subject-001 UUID
    const { data: subject001 } = await adminClient
      .from("subjects")
      .select("id")
      .eq("legacy_id", "subject-001")
      .single();

    // Create initial mark row for temp student
    const { data: createdMark, error: mCreateErr } = await adminClient
      .from("marks")
      .insert({
        student_id: tempStudentDbId,
        subject_id: subject001.id,
        semester: "3",
        mid_sem_1: 15,
        mid_sem_2: 15,
        end_sem: 30,
        internal: 8,
      })
      .select("id, total, grade")
      .single();

    if (mCreateErr) throw mCreateErr;
    tempMarkDbId = createdMark.id;

    // 2. Priya (TA) signs in
    const taClient = createAnonClient();
    const { error: taLoginErr } = await taClient.auth.signInWithPassword({
      email: "ta.priya@campussync.edu",
      password: "ta123456",
    });

    if (taLoginErr) throw new Error(`TA sign-in failed: ${taLoginErr.message}`);

    // 3. Priya updates mid_sem_1 on assigned subject
    const { data: taUpdateData, error: taUpdateErr } = await taClient
      .from("marks")
      .update({ mid_sem_1: 22 }) // updating from 15 to 22
      .eq("id", tempMarkDbId)
      .select("id, mid_sem_1, total, grade")
      .single();

    assert(
      "Priya (TA) can update mid_sem_1 on assigned subject mark",
      !taUpdateErr && taUpdateData?.mid_sem_1 === 22,
      `Updated mid_sem_1: ${taUpdateData?.mid_sem_1}, error: ${taUpdateErr?.message}`
    );

    // Verify trigger recomputed total and grade (22 + 15 + 30 + 8 = 75 -> B+)
    const totalRecomputed = taUpdateData?.total === 75;
    const gradeRecomputed = taUpdateData?.grade === "B+";
    assert(
      "Postgres trigger recomputed total (75) and grade (B+) automatically",
      totalRecomputed && gradeRecomputed,
      `Got total: ${taUpdateData?.total}, grade: ${taUpdateData?.grade}`
    );

    // 4. Priya attempts to update forbidden column (student_id or subject_id)
    const { error: colPrivErr } = await taClient
      .from("marks")
      .update({ student_id: aaravStudent?.id || tempStudentDbId })
      .eq("id", tempMarkDbId);

    assert(
      "Priya cannot update student_id (column privilege restricts update to score columns)",
      Boolean(colPrivErr),
      `Column update result error: ${colPrivErr?.message}`
    );

    await taClient.auth.signOut();
  } finally {
    // 5. Cleanup temporary test fixtures
    if (tempStudentDbId) {
      await adminClient.from("marks").delete().eq("student_id", tempStudentDbId);
      await adminClient.from("students").delete().eq("id", tempStudentDbId);
      console.log(`[CLEANUP] Deleted temporary test student (${tempStudentDbId}) and associated marks.`);
    }
  }

  console.log("==================================================");
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed.`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

// Written for post-import validation; not executed at this stage
module.exports = { runRlsTests };
if (require.main === module) {
  runRlsTests().catch(err => {
    console.error("Fatal RLS test error:", err);
    process.exit(1);
  });
}
