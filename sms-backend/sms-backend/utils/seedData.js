// ============================================================
// CampusSync — Full Initial Database Seeder
// Populates MongoDB with demo accounts, subjects, Kaggle-based
// student exam distributions, marks, attendance, timetable,
// notifications, attendance requests, and mess menu.
// ============================================================

const User = require("../models/User");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Marks = require("../models/Marks");
const Attendance = require("../models/Attendance");
const Timetable = require("../models/Timetable");
const Notification = require("../models/Notification");
const AttendanceRequest = require("../models/AttendanceRequest");
const MessMenu = require("../models/MessMenu");

const INDIAN_FIRST_NAMES_M = [
  "Aarav","Vivaan","Aditya","Vihaan","Arjun","Reyansh","Sai","Arnav","Dhruv","Kabir",
  "Ansh","Shaurya","Atharva","Advait","Ishaan","Rudra","Ayaan","Darsh","Harsh","Kian",
  "Krishna","Laksh","Manav","Neil","Om","Parth","Pranav","Rohan","Sahil","Tanay",
  "Uday","Ved","Yash","Rishi","Dev","Aryan","Shivansh","Ritvik","Aahan","Aarush",
  "Kiaan","Ishan","Mihir","Nihal","Ojas","Pranjal","Rachit","Shlok","Tejas","Varun"
];
const INDIAN_FIRST_NAMES_F = [
  "Aditi","Ananya","Diya","Ishita","Kavya","Myra","Navya","Prisha","Riya","Saanvi",
  "Anika","Avni","Bhavya","Charvi","Dhanya","Eesha","Falguni","Gauri","Hina","Isha",
  "Jiya","Kiara","Lavanya","Meera","Nandini","Oviya","Pari","Riddhi","Sanya","Tanvi",
  "Uma","Vanshika","Wridhi","Yashvi","Zara","Tanya","Sneha","Pooja","Neha","Mahika",
  "Kriti","Jhanvi","Ira","Hiral","Garima","Esha","Divya","Charu","Bhumi","Aashi"
];
const LAST_NAMES = [
  "Sharma","Verma","Gupta","Patel","Singh","Reddy","Nair","Iyer","Mehta","Rao",
  "Joshi","Chauhan","Desai","Kumar","Mishra","Pandey","Saxena","Agarwal","Kapoor","Malhotra",
  "Thakur","Bhat","Sinha","Dubey","Tiwari","Yadav","Chandra","Rathore","Ghosh","Banerjee"
];

const BRANCHES = ["CSE","AI_ML","ECE","ME","CE"];
const SECTIONS = ["A","B","C","D","E"];
const PARENTAL_EDUCATION = [
  "some high school","high school","some college",
  "associate's degree","bachelor's degree","master's degree"
];
const PARENTAL_ED_WEIGHTS = [0.12, 0.20, 0.23, 0.14, 0.17, 0.14];
const LUNCH_TYPES = ["standard","free/reduced"];
const LUNCH_WEIGHTS = [0.645, 0.355];
const TEST_PREP = ["none","completed"];
const TEST_PREP_WEIGHTS = [0.642, 0.358];

const SUBJECTS_DEF = [
  { code: "MA201", name: "Mathematics", credits: 4, branch: "ALL" },
  { code: "EN201", name: "English", credits: 3, branch: "ALL" },
  { code: "TC201", name: "Technical Communication", credits: 2, branch: "ALL" },
  { code: "DS301", name: "Data Structures", credits: 4, branch: "ALL" },
  { code: "PH201", name: "Physics", credits: 3, branch: "ALL" },
  { code: "PC201", name: "Programming in C", credits: 4, branch: "ALL" },
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

let _seed = 123456789;
function pseudoRandom() {
  _seed = (_seed * 9301 + 49297) % 233280;
  return _seed / 233280;
}

const pick = (arr) => arr[Math.floor(pseudoRandom() * arr.length)];
const pickWeighted = (arr, weights) => {
  const r = pseudoRandom();
  let cum = 0;
  for (let i = 0; i < arr.length; i++) {
    cum += weights[i];
    if (r <= cum) return arr[i];
  }
  return arr[arr.length - 1];
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const gaussRandom = (mean, std) => {
  let u = 0, v = 0;
  while (u === 0) u = pseudoRandom();
  while (v === 0) v = pseudoRandom();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};
const randomDOB = () => {
  const year = 2004 + Math.floor(pseudoRandom() * 3);
  const month = 1 + Math.floor(pseudoRandom() * 12);
  const day = 1 + Math.floor(pseudoRandom() * 28);
  return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
};
const randomPhone = () => `9${Math.floor(100000000 + pseudoRandom() * 899999999)}`;

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

function generateInitialData() {
  _seed = 123456789; // Reset seed for consistent deterministic data

  // 1. Staff Users
  const users = [
    { _id: "user-admin-001", name: "Dr. Rajesh Kumar", email: "admin@campussync.edu", password: "admin123", role: "admin", dob: "1975-06-15" },
    { _id: "user-faculty-001", name: "Prof. Sunita Sharma", email: "prof.sharma@campussync.edu", password: "faculty123", role: "faculty", dob: "1980-03-22" },
    { _id: "user-faculty-002", name: "Prof. Vikram Mehta", email: "prof.mehta@campussync.edu", password: "faculty123", role: "faculty", dob: "1978-11-05" },
    { _id: "user-ta-001", name: "Priya Desai", email: "ta.priya@campussync.edu", password: "ta123", role: "ta", dob: "2001-09-10" },
    { _id: "user-examcell-001", name: "Exam Controller Office", email: "examcell@campussync.edu", password: "examcell123", role: "exam_cell", dob: "1970-01-01" },
  ];

  // 2. Subjects
  const subjects = SUBJECTS_DEF.map((s, i) => ({
    _id: `subject-${String(i + 1).padStart(3, "0")}`,
    ...s,
    semester: "3",
    facultyId: i % 2 === 0 ? "user-faculty-001" : "user-faculty-002",
  }));

  // 3. Students, Student Users, Marks, Attendance
  const students = [];
  const marks = [];
  const attendance = [];
  const usedNames = new Set();

  for (let i = 0; i < 1000; i++) {
    let gender, firstName, lastName, fullName, branch, sectionRaw, parentalEd, lunchType, testPrep, dob, rollNo, email;

    if (i === 0) {
      gender = "male";
      firstName = "Aarav";
      lastName = "Sharma";
      fullName = "Aarav Sharma";
      branch = "CSE";
      sectionRaw = "A";
      parentalEd = "bachelor's degree";
      lunchType = "standard";
      testPrep = "completed";
      dob = "2005-03-15";
      rollNo = "CSE-001";
      email = "aarav.sharma@campussync.edu";
      usedNames.add(fullName);
    } else {
      gender = pseudoRandom() < 0.518 ? "female" : "male";
      firstName = pick(gender === "male" ? INDIAN_FIRST_NAMES_M : INDIAN_FIRST_NAMES_F);
      lastName = pick(LAST_NAMES);
      fullName = `${firstName} ${lastName}`;
      let attempts = 0;
      while (usedNames.has(fullName) && attempts < 20) {
        lastName = pick(LAST_NAMES);
        fullName = `${firstName} ${lastName}`;
        attempts++;
      }
      if (usedNames.has(fullName)) fullName = `${firstName} ${lastName} ${i}`;
      usedNames.add(fullName);

      const branchIdx = Math.floor(i / 200);
      branch = BRANCHES[branchIdx] || BRANCHES[Math.floor(pseudoRandom() * BRANCHES.length)];
      sectionRaw = SECTIONS[i % 5];
      parentalEd = pickWeighted(PARENTAL_EDUCATION, PARENTAL_ED_WEIGHTS);
      lunchType = pickWeighted(LUNCH_TYPES, LUNCH_WEIGHTS);
      testPrep = pickWeighted(TEST_PREP, TEST_PREP_WEIGHTS);
      dob = randomDOB();
      rollNo = `${branch.replace("_","")}-${String((i % 200) + 1).padStart(3, "0")}`;
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@campussync.edu`;
    }

    const mathScore = clamp(Math.round(gaussRandom(66.1, 15.2)), 0, 100);
    const readingScore = clamp(Math.round(gaussRandom(69.2, 14.6)), 0, 100);
    const writingScore = clamp(Math.round(gaussRandom(68.1, 15.2)), 0, 100);

    let feeStatus;
    if (lunchType === "standard") {
      feeStatus = "paid";
    } else {
      feeStatus = pseudoRandom() < 0.6 ? "pending" : "overdue";
    }
    const feeAmount = lunchType === "standard" ? 75000 : 35000;

    const studentId = `student-${String(i + 1).padStart(4, "0")}`;
    const studentUserId = `user-student-${String(i + 1).padStart(4, "0")}`;

    students.push({
      _id: studentId,
      userId: studentUserId,
      name: fullName,
      rollNo,
      branch,
      section: sectionRaw,
      semester: "3",
      gender,
      email,
      contact: randomPhone(),
      dob,
      parentalEducation: parentalEd,
      lunchType,
      testPrepStatus: testPrep,
      feeStatus,
      feeAmount,
    });

    // Create User account for student
    users.push({
      _id: studentUserId,
      name: fullName,
      email,
      password: dob, // DOB is student login password
      role: "student",
      dob,
      studentRef: studentId,
    });

    // Marks for 6 subjects
    const kaggleScores = [mathScore, readingScore, writingScore];
    subjects.forEach((subj, si) => {
      let midSem1, midSem2, endSem, internal;
      if (si < 3) {
        const baseScore = kaggleScores[si];
        midSem1 = clamp(Math.round(baseScore * 0.25 + gaussRandom(0, 3)), 0, 25);
        midSem2 = clamp(Math.round(baseScore * 0.25 + gaussRandom(0, 3)), 0, 25);
        endSem = clamp(Math.round(baseScore * 0.4 + gaussRandom(0, 5)), 0, 40);
        internal = clamp(Math.round(baseScore * 0.1 + gaussRandom(0, 1)), 0, 10);
      } else {
        const baseScore = clamp(mathScore + Math.round(gaussRandom(0, 10)), 0, 100);
        midSem1 = clamp(Math.round(baseScore * 0.25 + gaussRandom(0, 3)), 0, 25);
        midSem2 = clamp(Math.round(baseScore * 0.25 + gaussRandom(0, 3)), 0, 25);
        endSem = clamp(Math.round(baseScore * 0.4 + gaussRandom(0, 5)), 0, 40);
        internal = clamp(Math.round(baseScore * 0.1 + gaussRandom(0, 1)), 0, 10);
      }
      const total = midSem1 + midSem2 + endSem + internal;

      marks.push({
        _id: `marks-${studentId}-${subj._id}`,
        studentId,
        subjectId: subj._id,
        subjectCode: subj.code,
        subjectName: subj.name,
        midSem1,
        midSem2,
        endSem,
        internal,
        total,
        grade: calcGrade(total),
        semester: "3",
      });
    });

    // Attendance (30 days)
    const avgScore = (mathScore + readingScore + writingScore) / 3;
    const attendanceRate = clamp(0.6 + (avgScore / 100) * 0.35, 0.55, 0.98);
    const baseDate = new Date("2026-03-01T10:00:00.000Z");

    for (let d = 0; d < 30; d++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().slice(0, 10);
      if (date.getDay() === 0) continue; // skip Sundays

      const subjForDay = subjects[d % subjects.length];
      const status = pseudoRandom() < attendanceRate ? "present" : "absent";
      attendance.push({
        _id: `att-${studentId}-${dateStr}-${subjForDay._id}`,
        studentId,
        subjectId: subjForDay._id,
        date: dateStr,
        status,
        compensationReason: null,
        approvedBy: null,
      });
    }
  }

  // 4. Timetable
  const timetable = [];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const rooms = ["LH-101","LH-102","LH-201","LH-202","Lab-A","Lab-B","Lab-C","CR-301","CR-302","CR-303"];
  let tCounter = 1000;

  BRANCHES.forEach((branch) => {
    SECTIONS.forEach((section) => {
      DAYS.forEach((day) => {
        periods.forEach((period) => {
          if (day === "Saturday" && period > 4) return;
          const subj = subjects[(period - 1 + DAYS.indexOf(day)) % subjects.length];
          timetable.push({
            _id: `tt-${++tCounter}`,
            branch,
            section,
            semester: "3",
            day,
            period,
            subjectId: subj._id,
            subjectCode: subj.code,
            subjectName: subj.name,
            room: rooms[Math.floor(pseudoRandom() * rooms.length)],
            facultyId: subj.facultyId,
          });
        });
      });
    });
  });

  // 5. Notifications
  const notifications = [
    { _id: "notif-001", senderId: "user-admin-001", senderRole: "admin", senderName: "Dr. Rajesh Kumar", recipientType: "all", recipientId: null, title: "Welcome to Semester 3", message: "Welcome back students! Classes begin Monday. Please check your timetables.", isRead: false, createdAt: new Date(Date.now() - 86400000) },
    { _id: "notif-002", senderId: "user-faculty-001", senderRole: "faculty", senderName: "Prof. Sunita Sharma", recipientType: "all", recipientId: null, title: "Math Mid-Sem 1 Results", message: "Mid-semester 1 marks for Mathematics have been uploaded. Please check your marks section.", isRead: false, createdAt: new Date(Date.now() - 172800000) },
    { _id: "notif-003", senderId: "user-examcell-001", senderRole: "exam_cell", senderName: "Exam Controller Office", recipientType: "all", recipientId: null, title: "End Semester Exam Schedule", message: "End semester examinations will commence from December 15. Detailed schedule will be shared soon.", isRead: false, createdAt: new Date(Date.now() - 259200000) },
    { _id: "notif-004", senderId: "user-ta-001", senderRole: "ta", senderName: "Priya Desai", recipientType: "student", recipientId: "student-0001", title: "Assignment Reminder", message: "Please submit your Data Structures assignment by Friday.", isRead: false, createdAt: new Date(Date.now() - 43200000) },
    { _id: "notif-005", senderId: "user-faculty-002", senderRole: "faculty", senderName: "Prof. Vikram Mehta", recipientType: "all", recipientId: null, title: "Lab Session Rescheduled", message: "Programming in C lab session for Section A is rescheduled to Thursday 2PM.", isRead: true, createdAt: new Date(Date.now() - 345600000) },
    { _id: "notif-006", senderId: "user-admin-001", senderRole: "admin", senderName: "Dr. Rajesh Kumar", recipientType: "all", recipientId: null, title: "Fee Payment Deadline", message: "Last date for fee payment is September 30. Late fee of Rs. 500 will be applicable.", isRead: false, createdAt: new Date(Date.now() - 432000000) },
    { _id: "notif-007", senderId: "user-student-0001", senderRole: "student", senderName: "Aarav Sharma", recipientType: "ta", recipientId: "user-ta-001", title: "Doubt in DSA", message: "Ma'am, I have a doubt in the binary tree traversal topic. Can we discuss after class?", isRead: false, createdAt: new Date(Date.now() - 21600000) },
    { _id: "notif-008", senderId: "user-student-0002", senderRole: "student", senderName: "Student 2", recipientType: "faculty", recipientId: "user-faculty-001", title: "Re-evaluation Request", message: "Prof. Sharma, I would like to request re-evaluation of my Math mid-sem 1 paper. Roll No: CSE-002.", isRead: false, createdAt: new Date(Date.now() - 36000000) },
  ];

  // 6. Attendance Requests
  const attendanceRequests = [
    { _id: "areq-001", studentId: "student-0001", studentName: "Aarav Sharma", rollNo: "CSE-001", eventName: "Hackathon 2026", eventDate: "2026-02-25", reason: "college_function", status: "pending_ta", taReviewedBy: null, facultyApprovedBy: null, createdAt: new Date(Date.now() - 86400000) },
    { _id: "areq-002", studentId: "student-0003", studentName: students[2]?.name || "Student 3", rollNo: students[2]?.rollNo || "CSE-003", eventName: "Coding Club Meeting", eventDate: "2026-02-24", reason: "club_meeting", status: "pending_faculty", taReviewedBy: "user-ta-001", facultyApprovedBy: null, createdAt: new Date(Date.now() - 172800000) },
    { _id: "areq-003", studentId: "student-0005", studentName: students[4]?.name || "Student 5", rollNo: students[4]?.rollNo || "CSE-005", eventName: "Annual Sports Day", eventDate: "2026-02-20", reason: "sports", status: "approved", taReviewedBy: "user-ta-001", facultyApprovedBy: "user-faculty-001", createdAt: new Date(Date.now() - 345600000) },
    { _id: "areq-004", studentId: "student-0010", studentName: students[9]?.name || "Student 10", rollNo: students[9]?.rollNo || "CSE-010", eventName: "Cultural Fest", eventDate: "2026-02-18", reason: "cultural", status: "rejected", taReviewedBy: "user-ta-001", facultyApprovedBy: null, createdAt: new Date(Date.now() - 432000000) },
    { _id: "areq-005", studentId: "student-0015", studentName: students[14]?.name || "Student 15", rollNo: students[14]?.rollNo || "CSE-015", eventName: "IEEE Workshop", eventDate: "2026-02-26", reason: "college_function", status: "pending_ta", taReviewedBy: null, facultyApprovedBy: null, createdAt: new Date(Date.now() - 43200000) },
  ];

  // 7. Mess Menu
  const messMenu = [
    { _id: "mess-mon", day: "Monday", breakfast: "Poha, Bread Butter, Milk Tea", lunch: "Dal Tadka, Rice, Roti, Mixed Veg, Salad", snacks: "Samosa, Chai", dinner: "Paneer Butter Masala, Rice, Roti, Dal, Ice Cream" },
    { _id: "mess-tue", day: "Tuesday", breakfast: "Idli Sambhar, Chutney, Coffee", lunch: "Rajma Chawal, Roti, Aloo Gobi, Raita", snacks: "Bread Pakora, Lemonade", dinner: "Chole Bhature, Rice, Salad, Gulab Jamun" },
    { _id: "mess-wed", day: "Wednesday", breakfast: "Aloo Paratha, Curd, Pickle, Tea", lunch: "Dal Fry, Jeera Rice, Roti, Bhindi Fry, Papad", snacks: "Veg Sandwich, Juice", dinner: "Malai Kofta, Rice, Roti, Dal Makhani, Kheer" },
    { _id: "mess-thu", day: "Thursday", breakfast: "Chole Bhature, Lassi", lunch: "Kadhi Pakora, Rice, Roti, Aloo Matar, Salad", snacks: "Momos, Green Chutney", dinner: "Mix Veg Curry, Rice, Roti, Yellow Dal, Fruit Custard" },
    { _id: "mess-fri", day: "Friday", breakfast: "Upma, Vada, Coconut Chutney, Filter Coffee", lunch: "Chana Masala, Rice, Roti, Palak Paneer, Raita", snacks: "Pav Bhaji", dinner: "Shahi Paneer, Biryani, Roti, Salad, Rasmalai" },
    { _id: "mess-sat", day: "Saturday", breakfast: "Dosa, Sambhar, Chutney, Tea", lunch: "Dal Palak, Rice, Roti, Baingan Bharta, Papad", snacks: "Maggi, Cold Drink", dinner: "Veg Pulao, Paneer Tikka, Roti, Dal, Halwa" },
    { _id: "mess-sun", day: "Sunday", breakfast: "Puri Sabji, Sprouts, Chai", lunch: "Special Thali - Paneer, Dal, Rice, 3 Roti, Salad, Sweet, Papad", snacks: "Pizza, Pasta, Shake", dinner: "Butter Naan, Dal Makhani, Veg Manchurian, Rice, Brownie" },
  ];

  return { users, subjects, students, marks, attendance, timetable, notifications, attendanceRequests, messMenu };
}

async function seedDatabase(force = false) {
  const existingCount = await User.countDocuments();
  if (existingCount > 0 && !force) {
    console.log(`Database already contains ${existingCount} users. Skipping seeding.`);
    return false;
  }

  console.log("Starting full database seeding into MongoDB...");
  if (force) {
    console.log("Force option enabled: clearing existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Subject.deleteMany({}),
      Marks.deleteMany({}),
      Attendance.deleteMany({}),
      Timetable.deleteMany({}),
      Notification.deleteMany({}),
      AttendanceRequest.deleteMany({}),
      MessMenu.deleteMany({}),
    ]);
  }

  const data = generateInitialData();

  console.log(`Inserting ${data.users.length} users...`);
  // Insert users in chunks for performance
  for (let i = 0; i < data.users.length; i += 500) {
    await User.insertMany(data.users.slice(i, i + 500), { ordered: false });
  }

  console.log(`Inserting ${data.subjects.length} subjects...`);
  await Subject.insertMany(data.subjects);

  console.log(`Inserting ${data.students.length} students...`);
  for (let i = 0; i < data.students.length; i += 500) {
    await Student.insertMany(data.students.slice(i, i + 500), { ordered: false });
  }

  console.log(`Inserting ${data.marks.length} marks records...`);
  for (let i = 0; i < data.marks.length; i += 1000) {
    await Marks.insertMany(data.marks.slice(i, i + 1000), { ordered: false });
  }

  console.log(`Inserting ${data.attendance.length} attendance records...`);
  for (let i = 0; i < data.attendance.length; i += 1000) {
    await Attendance.insertMany(data.attendance.slice(i, i + 1000), { ordered: false });
  }

  console.log(`Inserting ${data.timetable.length} timetable records...`);
  for (let i = 0; i < data.timetable.length; i += 500) {
    await Timetable.insertMany(data.timetable.slice(i, i + 500), { ordered: false });
  }

  console.log(`Inserting ${data.notifications.length} notifications...`);
  await Notification.insertMany(data.notifications);

  console.log(`Inserting ${data.attendanceRequests.length} attendance requests...`);
  await AttendanceRequest.insertMany(data.attendanceRequests);

  console.log(`Inserting ${data.messMenu.length} mess menu items...`);
  await MessMenu.insertMany(data.messMenu);

  console.log("Database seeded successfully into MongoDB!");
  return true;
}

module.exports = { generateInitialData, seedDatabase };
