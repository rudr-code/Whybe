require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { seedDatabase } = require("./utils/seedData");

const run = async () => {
  try {
    await connectDB();
    await seedDatabase(true);
    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

run();

