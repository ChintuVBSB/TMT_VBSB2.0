import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../src/models/user.js";

dotenv.config();

// MongoDB connection
mongoose.connect("mongodb+srv://ithelpdesk:gJwKPgISrv9LO1Kn@cluster0.z57nyx3.mongodb.net/task-flow", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const defaultPassword = "password123";

const seedUsers = [
  { name: "Harikesh Mourya", email: "Harikesh.m@vbsb.in", role: "manager" },
  { name: "Anjali Bachani", email: "anjali.b@vbsb.in", role: "staff" },
  { name: "Anjali Batham", email: "Hr@vbsb.in", role: "staff" },
  { name: "Astha Dubey", email: "astha.d@vbsb.in", role: "staff" },
  { name: "Ayush Hassani", email: "ayush.h@vbsb.in", role: "staff" },
  { name: "Rupali Parmar", email: "compliance@vbsb.in", role: "staff" },
  { name: "Sujeet pandit", email: "sujeet.p@vbsb.in", role: "staff" },
  { name: "Nischal Nahar", email: "nischal.n@vbsb.in", role: "staff" },
];

const runSeeder = async () => {
  try {
    for (let userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️ Skipped: ${userData.email} (already exists)`);
        continue;
      }
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await User.create({
        ...userData,
        password: hashedPassword
      });
      console.log(`✅ Created: ${userData.email} (Role: ${userData.role})`);
    }

    console.log("\n📋 All Users in DB:");
    const allUsers = await User.find({}, { name: 1, email: 1, role: 1, _id: 0 });
    allUsers.forEach(u => {
      console.log(`${u.name} | ${u.email} | ${u.role} | ${defaultPassword}`);
    });

    process.exit();
  } catch (err) {
    console.error("❌ Seeder Error:", err);
    process.exit(1);
  }
};

runSeeder();
