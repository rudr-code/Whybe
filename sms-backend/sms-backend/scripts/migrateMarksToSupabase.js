/**
 * migrateMarksToSupabase.js
 * Imports supporting entities and 6,000 marks into Supabase from dataStore.js.
 * 
 * Usage:
 *   node scripts/migrateMarksToSupabase.js --dry-run
 *   node scripts/migrateMarksToSupabase.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dataStore = require("../dataStore");
const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");

const isDryRun = process.argv.includes("--dry-run");

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

// Helper: paginated search in auth.admin.listUsers
async function findAuthUserByEmail(email) {
  const clean = email.toLowerCase().trim();
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw new Error(`Failed to list auth users on page ${page}: ${error.message}`);
    }
    const users = data?.users || [];
    const match = users.find(u => u.email?.toLowerCase().trim() === clean);
    if (match) return match;
    if (users.length < perPage) break;
    page++;
  }
  return null;
}

async function main() {
  console.log("==================================================");
  console.log(`Starting Marks Migration Script ${isDryRun ? "[DRY-RUN MODE]" : "[LIVE EXECUTION]"}`);
  console.log("==================================================");

  // -------------------------------------------------------------
  // DRY RUN: In-Memory Validation & Computed Statistics
  // -------------------------------------------------------------
  if (isDryRun) {
    console.log("\n[DRY RUN] Performing comprehensive in-memory data validation...");

    // 1. Validate Students
    const studentIds = new Set();
    const seenRollNumbers = new Set();
    let invalidStudents = 0;
    let rollEmpty = 0;
    let rollDuplicates = 0;
    let branchEmpty = 0;
    let sectionEmpty = 0;

    for (const s of dataStore.students) {
      if (!s._id || studentIds.has(s._id) || !s.name) {
        invalidStudents++;
      }
      studentIds.add(s._id);

      if (!s.rollNo || typeof s.rollNo !== "string" || !s.rollNo.trim()) {
        rollEmpty++;
      } else if (seenRollNumbers.has(s.rollNo.trim())) {
        rollDuplicates++;
      } else {
        seenRollNumbers.add(s.rollNo.trim());
      }

      if (!s.branch || typeof s.branch !== "string" || !s.branch.trim()) {
        branchEmpty++;
      }
      if (!s.section || typeof s.section !== "string" || !s.section.trim()) {
        sectionEmpty++;
      }
    }

    // 2. Validate Subjects
    const subjectIds = new Set();
    const seenSubjectCodes = new Set();
    let invalidSubjects = 0;
    let invalidCredits = 0;
    let codeEmpty = 0;
    let codeDuplicates = 0;

    for (const subj of dataStore.subjects) {
      if (!subj._id || subjectIds.has(subj._id) || !subj.name) {
        invalidSubjects++;
      }
      subjectIds.add(subj._id);

      if (!subj.code || typeof subj.code !== "string" || !subj.code.trim()) {
        codeEmpty++;
      } else if (seenSubjectCodes.has(subj.code.trim())) {
        codeDuplicates++;
      } else {
        seenSubjectCodes.add(subj.code.trim());
      }

      if (typeof subj.credits !== "number" || subj.credits <= 0) {
        invalidCredits++;
      }
    }

    // 3. Validate Staff Accounts (built dynamically from dataStore.users)
    const accountsToProvision = dataStore.users.filter(u =>
      u.role !== "student" || u.studentRef === "student-0001"
    );

    const computedStaffAssignments = [];
    for (const subj of dataStore.subjects) {
      if (subj.facultyId) {
        computedStaffAssignments.push({ subjectId: subj._id, staffId: subj.facultyId, role: "faculty" });
      }
    }
    // Priya Desai (TA) assigned to every subject
    for (const subj of dataStore.subjects) {
      computedStaffAssignments.push({ subjectId: subj._id, staffId: "user-ta-001", role: "ta" });
    }

    // 4. Validate Marks
    const seenMarkIds = new Set();
    const seenPairs = new Set();
    let markIdEmpty = 0;
    let markIdDuplicates = 0;
    let duplicatePairs = 0;
    let unmappedStudents = 0;
    let unmappedSubjects = 0;
    let rangeViolations = 0;
    let sumDiscrepancies = 0;
    let gradeDiscrepancies = 0;

    for (const m of dataStore.marks) {
      // Mark unique _id validation
      if (!m._id || typeof m._id !== "string" || !m._id.trim()) {
        markIdEmpty++;
      } else if (seenMarkIds.has(m._id.trim())) {
        markIdDuplicates++;
      } else {
        seenMarkIds.add(m._id.trim());
      }

      // Mapping check
      if (!studentIds.has(m.studentId)) unmappedStudents++;
      if (!subjectIds.has(m.subjectId)) unmappedSubjects++;

      // Duplicate pair check
      const pairKey = `${m.studentId}::${m.subjectId}`;
      if (seenPairs.has(pairKey)) {
        duplicatePairs++;
      }
      seenPairs.add(pairKey);

      // CHECK constraint bounds validation
      const mid1 = Number(m.midSem1);
      const mid2 = Number(m.midSem2);
      const end = Number(m.endSem);
      const int = Number(m.internal);
      const tot = Number(m.total);

      if (mid1 < 0 || mid1 > 25 || mid2 < 0 || mid2 > 25 || end < 0 || end > 40 || int < 0 || int > 10) {
        rangeViolations++;
      }

      if (tot !== (mid1 + mid2 + end + int)) {
        sumDiscrepancies++;
      }

      if (m.grade !== calcGrade(tot)) {
        gradeDiscrepancies++;
      }
    }

    // Print dynamically computed counts and validation results
    console.log(`- Students evaluated:           ${dataStore.students.length} (Invalid IDs: ${invalidStudents}, Empty Roll: ${rollEmpty}, Duplicate Roll: ${rollDuplicates}, Empty Branch: ${branchEmpty}, Empty Section: ${sectionEmpty})`);
    console.log(`- Subjects evaluated:           ${dataStore.subjects.length} (Invalid IDs: ${invalidSubjects}, Empty Code: ${codeEmpty}, Duplicate Code: ${codeDuplicates}, Invalid Credits: ${invalidCredits})`);
    console.log(`- Accounts dynamically derived: ${accountsToProvision.length} (5 staff + 1 demo student: ${accountsToProvision.map(a => a.email).join(", ")})`);
    console.log(`- Staff assignments computed:   ${computedStaffAssignments.length} (Faculty: ${dataStore.subjects.length}, TA: ${dataStore.subjects.length})`);
    console.log(`- Marks records evaluated:      ${dataStore.marks.length}`);
    console.log(`  * Empty mark _id count:        ${markIdEmpty}`);
    console.log(`  * Duplicate mark _id count:    ${markIdDuplicates}`);
    console.log(`  * Unmapped student references: ${unmappedStudents}`);
    console.log(`  * Unmapped subject references: ${unmappedSubjects}`);
    console.log(`  * Duplicate student-subj pairs: ${duplicatePairs}`);
    console.log(`  * CHECK range violations:       ${rangeViolations}`);
    console.log(`  * Component sum discrepancies:  ${sumDiscrepancies}`);
    console.log(`  * Grade calculation mismatches: ${gradeDiscrepancies}`);

    const hasValidationErrors = (
      invalidStudents > 0 ||
      rollEmpty > 0 ||
      rollDuplicates > 0 ||
      branchEmpty > 0 ||
      sectionEmpty > 0 ||
      invalidSubjects > 0 ||
      codeEmpty > 0 ||
      codeDuplicates > 0 ||
      invalidCredits > 0 ||
      markIdEmpty > 0 ||
      markIdDuplicates > 0 ||
      unmappedStudents > 0 ||
      unmappedSubjects > 0 ||
      duplicatePairs > 0 ||
      rangeViolations > 0 ||
      sumDiscrepancies > 0 ||
      gradeDiscrepancies > 0
    );

    if (!hasValidationErrors) {
      console.log("\n[DRY RUN] In-memory validation PASSED with 0 discrepancies.");
    } else {
      console.error("\n[DRY RUN] Validation FAILED with data inconsistencies.");
      process.exit(1);
    }

    console.log("\n[DRY RUN] Checking Supabase environment configuration in backend .env...");
    const urlConfigured = Boolean(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes("your-project-ref"));
    const keyConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-supabase-service-role-key"));

    console.log(`- SUPABASE_URL configured:              ${urlConfigured}`);
    console.log(`- SUPABASE_SERVICE_ROLE_KEY configured: ${keyConfigured}`);

    if (isSupabaseConfigured && supabaseAdmin) {
      console.log("\n[DRY RUN] Verifying read-only connectivity to Supabase...");
      const { data: testProfiles, error: testErr } = await supabaseAdmin.from("profiles").select("id").limit(1);
      if (testErr) {
        console.error("Database connection error:", testErr.message);
        process.exit(1);
      }
      console.log("Database connection successful. Dry run passed with zero writes.");
    } else {
      console.log("Note: Live Supabase ping skipped (credentials not configured in backend .env).");
      console.log("In-memory dry-run validation finished with zero writes.");
    }
    return;
  }

  // -------------------------------------------------------------
  // Step 1: Provision Profiles (Derived from dataStore.users)
  // -------------------------------------------------------------
  console.log("\n--- Step 1: Provisioning Profiles ---");
  if (!isSupabaseConfigured || !supabaseAdmin) {
    console.error("Error: Supabase is not properly configured in backend .env");
    console.error("Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
    process.exit(1);
  }

  const accountsToProvision = dataStore.users.filter(u =>
    u.role !== "student" || u.studentRef === "student-0001"
  );

  const profileMap = new Map(); // legacy_id -> uuid
  const studentRefToProfileMap = new Map(); // studentRef -> uuid

  for (const account of accountsToProvision) {
    const cleanEmail = account.email.toLowerCase().trim();

    // 1. Check if profile already exists in public.profiles
    const { data: existingProfile, error: pFindErr } = await supabaseAdmin
      .from("profiles")
      .select("id, legacy_id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (pFindErr) {
      throw new Error(`Error checking profile for ${cleanEmail}: ${pFindErr.message}`);
    }

    let authId = existingProfile?.id;

    // 2. If profile doesn't exist, create or look up in auth.users
    if (!authId) {
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: account.password,
        email_confirm: true,
        user_metadata: { name: account.name },
      });

      if (authErr) {
        if (authErr.message?.toLowerCase().includes("already registered") || authErr.message?.toLowerCase().includes("already exists")) {
          // Re-runnable: locate existing user by email in auth.users via paginated listUsers
          const matchedAuthUser = await findAuthUserByEmail(cleanEmail);
          if (!matchedAuthUser) {
            throw new Error(`User ${cleanEmail} reported as already registered but not found in listUsers`);
          }
          authId = matchedAuthUser.id;
        } else {
          throw new Error(`Failed to create auth user for ${cleanEmail}: ${authErr.message}`);
        }
      } else {
        authId = authUser?.user?.id;
      }
    }

    if (!authId) {
      throw new Error(`Could not determine auth ID for user ${cleanEmail}`);
    }

    // 3. Upsert profile in public.profiles with error check
    const { error: upsertErr } = await supabaseAdmin.from("profiles").upsert({
      id: authId,
      legacy_id: account._id,
      name: account.name,
      email: cleanEmail,
      role: account.role,
    });

    if (upsertErr) {
      throw new Error(`Failed to upsert profile for ${cleanEmail}: ${upsertErr.message}`);
    }

    profileMap.set(account._id, authId);
    if (account.studentRef) {
      studentRefToProfileMap.set(account.studentRef, authId);
    }
  }
  console.log(`Provisioned ${profileMap.size} user profiles from dataStore.users.`);

  // -------------------------------------------------------------
  // Step 2: Import Students (Omits profile_id; targeted update for student-0001)
  // -------------------------------------------------------------
  console.log("\n--- Step 2: Importing Students (Streamlined) ---");
  const studentMap = new Map(); // legacy_id -> uuid

  const studentBatches = [];
  for (let i = 0; i < dataStore.students.length; i += 200) {
    studentBatches.push(dataStore.students.slice(i, i + 200));
  }

  for (const batch of studentBatches) {
    // profile_id is intentionally omitted so bulk upsert never modifies or overwrites it
    const records = batch.map(s => ({
      legacy_id: s._id,
      name: s.name,
      roll_no: s.rollNo,
      branch: s.branch,
      section: s.section,
      semester: s.semester || "3",
    }));

    const { data: upserted, error: sErr } = await supabaseAdmin
      .from("students")
      .upsert(records, { onConflict: "legacy_id" })
      .select("id, legacy_id");

    if (sErr) {
      throw new Error(`Failed to upsert student batch: ${sErr.message}`);
    }
    upserted.forEach(r => studentMap.set(r.legacy_id, r.id));
  }
  console.log(`Imported ${studentMap.size} students into public.students.`);

  // Targeted link for student-0001 only if profile_id is currently null (never overwrites existing link)
  const student0001ProfileId = studentRefToProfileMap.get("student-0001");
  if (student0001ProfileId) {
    const { error: linkErr } = await supabaseAdmin
      .from("students")
      .update({ profile_id: student0001ProfileId })
      .eq("legacy_id", "student-0001")
      .is("profile_id", null);

    if (linkErr) {
      throw new Error(`Failed to link student-0001 profile_id: ${linkErr.message}`);
    }
  }

  // Verify student-0001 ends up with profile_id set
  const { data: verifiedStudent1, error: s1Err } = await supabaseAdmin
    .from("students")
    .select("id, legacy_id, profile_id")
    .eq("legacy_id", "student-0001")
    .single();

  if (s1Err || !verifiedStudent1?.profile_id) {
    throw new Error(`Verification failed: student-0001 does not have profile_id set!`);
  }
  console.log(`Verified: student-0001 has profile_id set to ${verifiedStudent1.profile_id}`);

  // -------------------------------------------------------------
  // Step 3: Import Subjects
  // -------------------------------------------------------------
  console.log("\n--- Step 3: Importing Subjects ---");
  const subjectMap = new Map(); // legacy_id -> uuid

  const subjectRecords = dataStore.subjects.map(s => ({
    legacy_id: s._id,
    code: s.code,
    name: s.name,
    credits: s.credits,
    branch: s.branch || "ALL",
    semester: s.semester || "3",
  }));

  const { data: upsertedSubjects, error: subErr } = await supabaseAdmin
    .from("subjects")
    .upsert(subjectRecords, { onConflict: "code" })
    .select("id, legacy_id, code");

  if (subErr) {
    throw new Error(`Failed to upsert subjects: ${subErr.message}`);
  }
  upsertedSubjects.forEach(s => subjectMap.set(s.legacy_id, s.id));
  console.log(`Imported ${subjectMap.size} subjects into public.subjects.`);

  // -------------------------------------------------------------
  // Step 4: Import Subject Staff Assignments (Option 1: TA on all 6)
  // -------------------------------------------------------------
  console.log("\n--- Step 4: Linking Staff to Subjects (Option 1) ---");
  const assignments = [];

  // Faculty assignments directly from dataStore.subjects.facultyId
  for (const subj of dataStore.subjects) {
    const subjectUuid = subjectMap.get(subj._id);
    const facultyUuid = profileMap.get(subj.facultyId);
    if (subjectUuid && facultyUuid) {
      assignments.push({
        subject_id: subjectUuid,
        staff_id: facultyUuid,
        role: "faculty",
      });
    }
  }

  // TA assignments: Priya Desai (user-ta-001) linked to all 6 subjects
  const taUuid = profileMap.get("user-ta-001");
  if (taUuid) {
    for (const [_, subjectUuid] of subjectMap) {
      assignments.push({
        subject_id: subjectUuid,
        staff_id: taUuid,
        role: "ta",
      });
    }
  }

  const { data: insertedAssignments, error: assignErr } = await supabaseAdmin
    .from("subject_staff_assignments")
    .upsert(assignments, { onConflict: "subject_id,staff_id" })
    .select("id");

  if (assignErr) {
    throw new Error(`Failed to upsert staff assignments: ${assignErr.message}`);
  }
  console.log(`Linked ${insertedAssignments.length} staff assignments (Faculty + TA on all 6 subjects).`);

  // -------------------------------------------------------------
  // Step 5: Import Marks (Omitting total & grade for trigger)
  // -------------------------------------------------------------
  console.log("\n--- Step 5: Importing Marks (Omitting total/grade for trigger execution) ---");
  const markBatches = [];
  for (let i = 0; i < dataStore.marks.length; i += 500) {
    markBatches.push(dataStore.marks.slice(i, i + 500));
  }

  let totalInserted = 0;
  for (let b = 0; b < markBatches.length; b++) {
    const batch = markBatches[b];
    const records = batch.map(m => {
      const studentUuid = studentMap.get(m.studentId);
      const subjectUuid = subjectMap.get(m.subjectId);
      if (!studentUuid || !subjectUuid) {
        throw new Error(`Missing relation for mark ${m._id}: student=${m.studentId}, subject=${m.subjectId}`);
      }
      return {
        legacy_id: m._id,
        student_id: studentUuid,
        subject_id: subjectUuid,
        semester: m.semester || "3",
        mid_sem_1: m.midSem1,
        mid_sem_2: m.midSem2,
        end_sem: m.endSem,
        internal: m.internal,
        // total and grade omitted: automatically computed by trigger
      };
    });

    const { error: markErr } = await supabaseAdmin
      .from("marks")
      .upsert(records, { onConflict: "legacy_id" });

    if (markErr) {
      throw new Error(`Failed to upsert marks batch ${b}: ${markErr.message}`);
    }
    totalInserted += records.length;
    process.stdout.write(`\rImported ${totalInserted} / ${dataStore.marks.length} marks...`);
  }
  console.log(`\nMarks import completed.`);

  // -------------------------------------------------------------
  // Step 6: Full Verification with .order("legacy_id") and count exact
  // -------------------------------------------------------------
  console.log("\n--- Step 6: Full Audit — Comparing ALL 6,000 Rows Against dataStore.js ---");
  let verifiedCount = 0;
  let mismatches = 0;

  const dataStoreMarksMap = new Map();
  dataStore.marks.forEach(m => dataStoreMarksMap.set(m._id, m));

  for (let offset = 0; offset < 6000; offset += 1000) {
    const { data: dbRows, error: fetchErr, count: exactCount } = await supabaseAdmin
      .from("marks")
      .select("legacy_id, mid_sem_1, mid_sem_2, end_sem, internal, total, grade, students!inner(legacy_id), subjects!inner(legacy_id)", { count: "exact" })
      .order("legacy_id", { ascending: true })
      .range(offset, offset + 999);

    if (fetchErr) {
      throw new Error(`Verification query error at offset ${offset}: ${fetchErr.message}`);
    }

    for (const row of dbRows) {
      const original = dataStoreMarksMap.get(row.legacy_id);
      if (!original) {
        console.error(`Row in database not found in dataStore: ${row.legacy_id}`);
        mismatches++;
        continue;
      }

      const studentMatch = row.students?.legacy_id === original.studentId;
      const subjectMatch = row.subjects?.legacy_id === original.subjectId;
      const totalMatches = Number(row.total) === original.total;
      const gradeMatches = row.grade === original.grade;
      const compMatches =
        Number(row.mid_sem_1) === original.midSem1 &&
        Number(row.mid_sem_2) === original.midSem2 &&
        Number(row.end_sem) === original.endSem &&
        Number(row.internal) === original.internal;

      if (!studentMatch || !subjectMatch || !totalMatches || !gradeMatches || !compMatches) {
        console.error(
          `Mismatch on ${row.legacy_id}: ` +
          `student(${row.students?.legacy_id} vs ${original.studentId}), ` +
          `subject(${row.subjects?.legacy_id} vs ${original.subjectId}), ` +
          `DB[total=${row.total}, grade=${row.grade}] vs Store[total=${original.total}, grade=${original.grade}]`
        );
        mismatches++;
      } else {
        verifiedCount++;
      }
    }
  }

  console.log("==================================================");
  console.log("FULL AUDIT VERIFICATION RESULTS:");
  console.log(`Total Rows Verified: ${verifiedCount} / 6,000`);
  console.log(`Mismatches Found:    ${mismatches}`);
  console.log("==================================================");

  if (mismatches > 0 || verifiedCount !== 6000) {
    console.error("FAILURE: Discrepancies detected during post-import verification.");
    process.exit(1);
  }

  // -------------------------------------------------------------
  // Step 7: End-of-Import Exact Count Asserts
  // -------------------------------------------------------------
  console.log("\n--- Step 7: End-of-Import Entity Asserts ---");
  const { count: finalSubjectCount, error: cntSubErr } = await supabaseAdmin
    .from("subjects")
    .select("id", { count: "exact", head: true });
  if (cntSubErr) throw cntSubErr;

  const { count: finalStudentCount, error: cntStuErr } = await supabaseAdmin
    .from("students")
    .select("id", { count: "exact", head: true });
  if (cntStuErr) throw cntStuErr;

  const { count: finalAssignCount, error: cntAssErr } = await supabaseAdmin
    .from("subject_staff_assignments")
    .select("id", { count: "exact", head: true });
  if (cntAssErr) throw cntAssErr;

  const { count: finalMarksCount, error: cntMarkErr } = await supabaseAdmin
    .from("marks")
    .select("id", { count: "exact", head: true });
  if (cntMarkErr) throw cntMarkErr;

  console.log(`Final Database Counts:`);
  console.log(`- Subjects:                  ${finalSubjectCount} (Expected: 6)`);
  console.log(`- Students:                  ${finalStudentCount} (Expected: 1000)`);
  console.log(`- Subject Staff Assignments: ${finalAssignCount} (Expected: 12)`);
  console.log(`- Marks:                     ${finalMarksCount} (Expected: 6000)`);

  if (finalSubjectCount !== 6) throw new Error(`Subject count assertion failed: ${finalSubjectCount} !== 6`);
  if (finalStudentCount !== 1000) throw new Error(`Student count assertion failed: ${finalStudentCount} !== 1000`);
  if (finalAssignCount !== 12) throw new Error(`Assignment count assertion failed: ${finalAssignCount} !== 12`);
  if (finalMarksCount !== 6000) throw new Error(`Marks count assertion failed: ${finalMarksCount} !== 6000`);

  console.log("\nAll end-of-import assertions PASSED successfully.");
}

main().catch(err => {
  console.error("Fatal migration error:", err);
  process.exit(1);
});
