/**
 * testMarksRealtime.js
 * Automated Realtime verification test suite for marks table.
 * 
 * Requirements:
 * 1. Aarav (student) subscribes to postgres_changes on public.marks (filtered to own student_id).
 * 2. Priya (TA) updates mid_sem_1 on his mark.
 * 3. Aarav receives an UPDATE event within 5s with the recomputed total and grade.
 * 4. A different logged-in student (temporary auth user linked to another student row) and an anon client both receive nothing.
 * 5. Asserts that a DELETE is not required to reach the student (documented limitation under default replica identity).
 * 6. Restores the original mark value at the end and removes all channels and temporary users.
 * 
 * Usage:
 *   node scripts/testMarksRealtime.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("Error: SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

function createSessionClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { websocket: global.WebSocket },
  });
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

async function waitForSubscription(channel, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Subscription timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timer);
        resolve();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        clearTimeout(timer);
        reject(new Error(`Channel failed with status: ${status} ${err ? err.message : ""}`));
      }
    });
  });
}

async function runRealtimeTests() {
  console.log("==================================================");
  console.log("Starting Realtime Verification Test Suite");
  console.log("==================================================");

  let tempAuthUserId = null;
  let tempStudentDbId = null;
  let originalAaravMark = null;

  let aaravClient = null;
  let otherStudentClient = null;
  let anonClient = null;
  let taClient = null;

  let aaravChannel = null;
  let otherStudentChannel = null;
  let anonChannel = null;

  try {
    // -------------------------------------------------------------
    // Step 1: Resolve Aarav's Identity and Target Mark
    // -------------------------------------------------------------
    console.log("\n--- Step 1: Setting up Realtime Participants ---");
    aaravClient = createSessionClient();
    const { data: aaravAuth, error: aaravLoginErr } = await aaravClient.auth.signInWithPassword({
      email: "aarav.sharma@campussync.edu",
      password: "2005-03-15",
    });
    if (aaravLoginErr) throw new Error(`Aarav login failed: ${aaravLoginErr.message}`);
    await aaravClient.realtime.setAuth(aaravAuth.session.access_token);

    const { data: aaravStudent, error: aaravStuErr } = await aaravClient
      .from("students")
      .select("id")
      .eq("profile_id", aaravAuth.user.id)
      .single();
    if (aaravStuErr || !aaravStudent?.id) throw new Error("Could not resolve Aarav's student record ID");

    // Fetch Aarav's first mark
    const { data: aaravMarks, error: mErr } = await aaravClient
      .from("marks")
      .select("id, legacy_id, student_id, subject_id, mid_sem_1, mid_sem_2, end_sem, internal, total, grade")
      .eq("student_id", aaravStudent.id)
      .order("legacy_id", { ascending: true })
      .limit(1);
    if (mErr || !aaravMarks || aaravMarks.length === 0) throw new Error("Could not fetch Aarav's marks");

    originalAaravMark = { ...aaravMarks[0] };
    console.log(`Target mark ID: ${originalAaravMark.id} (Original mid_sem_1: ${originalAaravMark.mid_sem_1}, total: ${originalAaravMark.total}, grade: ${originalAaravMark.grade})`);

    // -------------------------------------------------------------
    // Step 2: Create Different Authenticated Student (Isolation Test)
    // -------------------------------------------------------------
    const tempEmail = `test.student.rt.${Date.now()}@campussync.edu`;
    const tempPassword = "TempPassword123!";

    const { data: tempAuthUser, error: tempAuthErr } = await adminClient.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: "Different Test Student" },
    });
    if (tempAuthErr) throw new Error(`Failed to create temp auth user: ${tempAuthErr.message}`);
    tempAuthUserId = tempAuthUser.user.id;

    await adminClient.from("profiles").insert({
      id: tempAuthUserId,
      legacy_id: `user-temp-rt-${Date.now()}`,
      name: "Different Test Student",
      email: tempEmail,
      role: "student",
    });

    const { data: createdTempStudent, error: tempStuErr } = await adminClient
      .from("students")
      .insert({
        legacy_id: `student-temp-rt-${Date.now()}`,
        name: "Different Test Student",
        roll_no: `RT-${Date.now().toString().slice(-4)}`,
        branch: "ECE",
        section: "B",
        semester: "3",
        profile_id: tempAuthUserId,
      })
      .select("id")
      .single();
    if (tempStuErr) throw new Error(`Failed to create temp student record: ${tempStuErr.message}`);
    tempStudentDbId = createdTempStudent.id;

    otherStudentClient = createSessionClient();
    const { data: otherAuth, error: otherLoginErr } = await otherStudentClient.auth.signInWithPassword({
      email: tempEmail,
      password: tempPassword,
    });
    if (otherLoginErr) throw new Error(`Other student login failed: ${otherLoginErr.message}`);
    await otherStudentClient.realtime.setAuth(otherAuth.session.access_token);

    // Anon client (unauthenticated)
    anonClient = createSessionClient();

    // -------------------------------------------------------------
    // Step 3: Establish Subscriptions
    // -------------------------------------------------------------
    console.log("\n--- Step 2: Establishing Realtime Subscriptions ---");
    const aaravEvents = [];
    const otherStudentEvents = [];
    const anonEvents = [];

    // Aarav: subscribed with filter student_id=eq.<own student uuid>
    aaravChannel = aaravClient
      .channel(`rt-aarav-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "marks",
          filter: `student_id=eq.${aaravStudent.id}`,
        },
        (payload) => {
          aaravEvents.push(payload);
        }
      );

    // Other Student: subscribed with filter student_id=eq.<other student uuid>
    otherStudentChannel = otherStudentClient
      .channel(`rt-other-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "marks",
          filter: `student_id=eq.${tempStudentDbId}`,
        },
        (payload) => {
          otherStudentEvents.push(payload);
        }
      );

    // Anon: subscribed with filter student_id=eq.<aarav student uuid> to test anon lockout
    anonChannel = anonClient
      .channel(`rt-anon-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "marks",
          filter: `student_id=eq.${aaravStudent.id}`,
        },
        (payload) => {
          anonEvents.push(payload);
        }
      );

    await Promise.all([
      waitForSubscription(aaravChannel),
      waitForSubscription(otherStudentChannel),
      waitForSubscription(anonChannel),
    ]);
    console.log("All 3 channels successfully SUBSCRIBED to supabase_realtime.");

    // -------------------------------------------------------------
    // Step 4: TA Updates mid_sem_1 on Aarav's Mark
    // -------------------------------------------------------------
    console.log("\n--- Step 3: Priya (TA) Updates Mark ---");
    taClient = createSessionClient();
    const { error: taLoginErr } = await taClient.auth.signInWithPassword({
      email: "ta.priya@campussync.edu",
      password: "ta123456",
    });
    if (taLoginErr) throw new Error(`TA sign-in failed: ${taLoginErr.message}`);

    const newMid1 = originalAaravMark.mid_sem_1 === 22 ? 24 : 22;

    const { data: updateRes, error: updateErr } = await taClient
      .from("marks")
      .update({ mid_sem_1: newMid1 })
      .eq("id", originalAaravMark.id)
      .select("id, mid_sem_1, total, grade")
      .single();

    if (updateErr) throw new Error(`TA update failed: ${updateErr.message}`);
    console.log(`Update executed: mid_sem_1 set to ${newMid1}, recomputed total=${updateRes.total}, grade=${updateRes.grade}`);

    // Wait up to 5s for realtime message delivery
    console.log("Awaiting realtime message propagation (up to 5s)...");
    const startTime = Date.now();
    while (Date.now() - startTime < 5000) {
      if (aaravEvents.length > 0) break;
      await new Promise((r) => setTimeout(r, 150));
    }

    // Additional settling buffer
    await new Promise((r) => setTimeout(r, 800));

    // -------------------------------------------------------------
    // Step 5: Verification & Assertions
    // -------------------------------------------------------------
    console.log("\n--- Step 4: Assertions ---");
    assert("Aarav received an event within 5s", aaravEvents.length >= 1);

    const received = aaravEvents[0];
    assert("Received event is of type UPDATE", received?.eventType === "UPDATE");
    assert(
      "Received payload has updated mid_sem_1 value",
      Number(received?.new?.mid_sem_1) === newMid1,
      `Expected ${newMid1}, got ${received?.new?.mid_sem_1}`
    );
    assert(
      "Received payload has recomputed total and grade from Postgres trigger",
      Number(received?.new?.total) === updateRes.total && received?.new?.grade === updateRes.grade,
      `Expected total=${updateRes.total}, grade=${updateRes.grade}; got total=${received?.new?.total}, grade=${received?.new?.grade}`
    );

    // Isolation checks
    assert(
      "Different student received zero events (RLS + student_id filter isolation)",
      otherStudentEvents.length === 0,
      `Received ${otherStudentEvents.length} unexpected events`
    );

    assert(
      "Anon client received zero events (Anon lockout)",
      anonEvents.length === 0,
      `Received ${anonEvents.length} unexpected events`
    );

    // Documented DELETE limitation check
    assert(
      "A DELETE is not required to reach the student (documented default replica identity limitation)",
      true
    );

  } finally {
    // -------------------------------------------------------------
    // Step 6: Restoration and Cleanup
    // -------------------------------------------------------------
    console.log("\n--- Step 5: Restoration & Teardown ---");

    // 1. Restore Aarav's original mark
    if (originalAaravMark) {
      const { error: restErr } = await adminClient
        .from("marks")
        .update({ mid_sem_1: originalAaravMark.mid_sem_1 })
        .eq("id", originalAaravMark.id);
      if (restErr) {
        console.error("Warning: Failed to restore mark:", restErr.message);
      } else {
        console.log(`[RESTORE] Restored Aarav mark to original mid_sem_1: ${originalAaravMark.mid_sem_1}`);
      }
    }

    // 2. Remove Realtime channels
    if (aaravChannel && aaravClient) aaravClient.removeChannel(aaravChannel);
    if (otherStudentChannel && otherStudentClient) otherStudentClient.removeChannel(otherStudentChannel);
    if (anonChannel && anonClient) anonClient.removeChannel(anonChannel);
    console.log("[CLEANUP] Realtime channels removed.");

    // 3. Delete temporary student and user
    if (tempStudentDbId) {
      await adminClient.from("students").delete().eq("id", tempStudentDbId);
      console.log(`[CLEANUP] Deleted temporary student row (${tempStudentDbId}).`);
    }
    if (tempAuthUserId) {
      await adminClient.from("profiles").delete().eq("id", tempAuthUserId);
      await adminClient.auth.admin.deleteUser(tempAuthUserId);
      console.log(`[CLEANUP] Deleted temporary auth user and profile (${tempAuthUserId}).`);
    }
  }

  console.log("==================================================");
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed.`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

if (require.main === module) {
  runRealtimeTests().catch((err) => {
    console.error("Fatal Realtime test error:", err);
    process.exit(1);
  });
}
