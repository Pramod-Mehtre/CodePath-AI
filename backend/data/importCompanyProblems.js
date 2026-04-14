const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const CompanyProblem = require("../models/companyProblem.model");

const REPO_PATH = path.join(__dirname, "../../temp_repo");

// Connect to Atlas or local DB
const MONGO_URI = process.env.ATLAS_URI || process.env.MONGO_URI;

async function importData() {
  if (!MONGO_URI) {
    console.error("No MongoDB URI found in .env (ATLAS_URI or MONGO_URI)");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB successfully.");

    if (!fs.existsSync(REPO_PATH)) {
      console.error(`Temp repo not found at ${REPO_PATH}`);
      process.exit(1);
    }

    const directories = fs.readdirSync(REPO_PATH, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name !== ".git")
      .map(dirent => dirent.name);

    console.log(`Found ${directories.length} company folders.`);

    let totalInserted = 0;
    
    // Clear existing to avoid duplicate conflicts if running fresh, but user says "avoid duplicates"
    // So we'll use bulkWrite with upsert or just insertMany with ordered: false
    // Since this is a production-like script, bulkWrite with upsert is safer.

    for (const company of directories) {
      const companyPath = path.join(REPO_PATH, company);
      let csvFiles = fs.readdirSync(companyPath).filter(file => file.endsWith(".csv"));
      
      if (csvFiles.length === 0) continue;

      // Prefer "5. All.csv" if available, else combine all
      const allCsv = csvFiles.find(f => f.toLowerCase().includes("all.csv"));
      const filesToRead = allCsv ? [allCsv] : csvFiles;
      
      const problemsMap = new Map(); // Link -> problem Object

      for (const file of filesToRead) {
        const filePath = path.join(companyPath, file);
        
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => {
              // Usually cols: Difficulty, Title, Frequency, Acceptance Rate, Link, Topics
              // We need: title, difficulty, topic, link
              
              // Depending on CSV mapping sometimes it's all caps or capitalized
              const title = data["Title"] || data["title"];
              const link = data["Link"] || data["link"];
              const difficulty = data["Difficulty"] || data["difficulty"] || "Medium";
              const topic = data["Topics"] || data["topics"] || data["Topic"] || "Uncategorized";

              if (title && link) {
                // Deduplicate by link
                if (!problemsMap.has(link)) {
                  problemsMap.set(link, {
                    company,
                    title,
                    difficulty,
                    topic,
                    link
                  });
                }
              }
            })
            .on("end", resolve)
            .on("error", reject);
        });
      }

      if (problemsMap.size > 0) {
        const operations = Array.from(problemsMap.values()).map(prob => ({
          updateOne: {
            filter: { company: prob.company, link: prob.link },
            update: { $set: prob },
            upsert: true
          }
        }));

        try {
          const result = await CompanyProblem.bulkWrite(operations, { ordered: false });
          totalInserted += result.upsertedCount + result.modifiedCount;
          console.log(`Processed ${company}: Updated/Inserted ${problemsMap.size} problems.`);
        } catch (err) {
          console.error(`Error bulk inserting for company ${company}:`, err.message);
        }
      }
    }

    console.log(`\nImport complete! Total updated/inserted records: ${totalInserted}`);
    process.exit(0);

  } catch (error) {
    console.error("Database connection or import error:", error);
    process.exit(1);
  }
}

importData();
