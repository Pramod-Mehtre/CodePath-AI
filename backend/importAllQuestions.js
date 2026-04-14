const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CompanyProblem = require('./models/companyProblem.model');

dotenv.config();

const REPO_PATH = 'e:/PLACEMENT_PREP_TRACKER/temp_repo';
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI missing in .env");
  process.exit(1);
}

async function importAllData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas for full import...");

    const folders = fs.readdirSync(REPO_PATH).filter(f => 
      fs.statSync(path.join(REPO_PATH, f)).isDirectory() && !f.startsWith('.')
    );

    console.log(`Found ${folders.length} company folders.`);

    let totalProcessed = 0;
    let fileCount = 0;

    for (const company of folders) {
      const companyPath = path.join(REPO_PATH, company);
      const csvFiles = fs.readdirSync(companyPath).filter(f => f.endsWith('.csv'));

      for (const file of csvFiles) {
        fileCount++;
        const filePath = path.join(companyPath, file);
        const results = [];

        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', resolve)
            .on('error', reject);
        });

        if (results.length === 0) continue;

        const bulkOps = results.map(row => {
          // Normalize difficulty and handle potential column name variations
          const difficulty = (row.Difficulty || "Medium").toUpperCase();
          const title = row.Title || "Untitled";
          const link = row.Link || "#";
          
          return {
            updateOne: {
              filter: { title, link, company },
              update: { 
                $set: { 
                  title, 
                  link, 
                  company, 
                  difficulty 
                } 
              },
              upsert: true
            }
          };
        });

        // Execute in chunks
        if (bulkOps.length > 0) {
          try {
            const result = await CompanyProblem.bulkWrite(bulkOps, { ordered: false });
            totalProcessed += (result.upsertedCount + result.modifiedCount + result.matchedCount);
          } catch (bulkErr) {
            // Log partial errors but continue
            if (bulkErr.result) {
              totalProcessed += (bulkErr.result.upsertedCount + bulkErr.result.nModified + bulkErr.result.nMatched);
            }
          }
        }
        
        if (fileCount % 50 === 0) {
          console.log(`Processed ${fileCount} files... Currently at ${totalProcessed} records.`);
        }
      }
    }

    console.log("------------------------------------------");
    console.log(`IMPORT COMPLETE!`);
    console.log(`Total Files Processed: ${fileCount}`);
    
    const finalCount = await CompanyProblem.countDocuments();
    console.log(`Final Database Record Count: ${finalCount}`);
    console.log("------------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("Fatal Error during import:", err);
    process.exit(1);
  }
}

importAllData();
