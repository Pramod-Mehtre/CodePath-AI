const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Skill = require("./models/skill.model");

dotenv.config();

const initialSkills = [
  { name: "C", aliases: ["c", "c programming"], category: "language" },
  { name: "C++", aliases: ["c++", "cpp", "c plus plus"], category: "language" },
  { name: "Java", aliases: ["java"], category: "language" },
  { name: "Python", aliases: ["python"], category: "language" },
  { name: "JavaScript", aliases: ["javascript", "js"], category: "language" },
  { name: "DSA", aliases: ["dsa", "data structures", "algorithms"], category: "concept" },
  { name: "OS", aliases: ["os", "operating systems"], category: "concept" },
  { name: "DBMS", aliases: ["dbms", "database management", "sql"], category: "concept" },
  { name: "Computer Networks", aliases: ["computer networks", "cn"], category: "concept" },
  { name: "React", aliases: ["react", "reactjs"], category: "framework" },
  { name: "Node.js", aliases: ["node.js", "node"], category: "framework" },
  { name: "Express", aliases: ["express", "expressjs"], category: "framework" },
  { name: "MongoDB", aliases: ["mongodb", "mongo"], category: "database" },
  { name: "REST API", aliases: ["rest api", "api"], category: "concept" },
  { name: "Git", aliases: ["git", "github"], category: "tool" },
  { name: "System Design", aliases: ["system design", "hld", "lld"], category: "concept" },
  { name: "AWS", aliases: ["aws", "cloud"], category: "tool" }
];

async function seedSkills() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/preptracker");
    console.log("DB Connected for seeding...");

    for (const s of initialSkills) {
      await Skill.findOneAndUpdate(
        { name: s.name },
        s,
        { upsert: true, returnDocument: 'after' }
      );
    }

    console.log("Skills seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedSkills();
