// Populates the DB with demo data for your hackathon presentation.
// Run with: npm run seed

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Student = require("./models/Student");
const Attendance = require("./models/Attendance");

const firstNames = ["Aarav", "Vivaan", "Aditi", "Diya", "Kabir", "Ishaan", "Myra", "Ananya", "Reyansh", "Saanvi",
  "Advait", "Kiara", "Arjun", "Riya", "Vihaan", "Anika", "Shaurya", "Prisha", "Rudra", "Navya"];
const lastNames = ["Sharma", "Verma", "Gupta", "Patel", "Iyer", "Nair", "Reddy", "Singh", "Rao", "Mehta"];
const classes = ["10-A", "10-B", "11-A", "11-B", "12-A"];
const grades = ["A+", "A", "B+", "B", "C+"];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await User.deleteMany({});
  await Student.deleteMany({});
  await Attendance.deleteMany({});

  console.log("Creating demo accounts (admin / faculty)...");
  await User.create({
    name: "Admin User",
    email: "admin@sms.com",
    password: "admin123",
    role: "admin",
  });
  await User.create({
    name: "Faculty User",
    email: "faculty@sms.com",
    password: "faculty123",
    role: "faculty",
  });

  console.log("Creating 20 demo students...");
  const students = [];
  for (let i = 0; i < 20; i++) {
    const name = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
    const student = await Student.create({
      name,
      rollNo: `R${1000 + i}`,
      class: randomItem(classes),
      email: `${name.toLowerCase().replace(" ", ".")}@student.sms.com`,
      contact: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      feeStatus: randomItem(["paid", "pending", "overdue"]),
      feeAmount: [5000, 7500, 10000][Math.floor(Math.random() * 3)],
      grade: randomItem(grades),
    });
    students.push(student);
  }

  console.log("Generating 30 days of attendance per student...");
  const attendanceDocs = [];
  const today = new Date();
  for (const student of students) {
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      // Bias toward "present" so attendance % looks realistic (75-100%)
      const status = Math.random() < 0.85 ? "present" : "absent";
      attendanceDocs.push({ studentId: student._id, date, status });
    }
  }
  await Attendance.insertMany(attendanceDocs);

  console.log("\nSeed complete!");
  console.log("Login credentials:");
  console.log("  Admin:   admin@sms.com / admin123");
  console.log("  Faculty: faculty@sms.com / faculty123");
  console.log(`Created ${students.length} students with ${attendanceDocs.length} attendance records.`);

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
