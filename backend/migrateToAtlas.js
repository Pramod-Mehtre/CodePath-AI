const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const LOCAL_URI = "mongodb://127.0.0.1:27017/placement_tracker";
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI || ATLAS_URI.includes("127.0.0.1")) {
  console.error("Please provide a valid MongoDB Atlas URI in .env");
  process.exit(1);
}

async function migrate() {
  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    await localClient.connect();
    await atlasClient.connect();

    console.log("Connected to both local and Atlas DBs...");

    const localDb = localClient.db();
    const atlasDb = atlasClient.db();

    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate.`);

    for (const col of collections) {
      if (col.name === 'sessions') {
        console.log("Skipping 'sessions' collection...");
        continue;
      }

      console.log(`Migrating ${col.name}...`);
      const data = await localDb.collection(col.name).find({}).toArray();

      if (data.length > 0) {
        // Clear destination first (optional, but requested 'Ensure all existing data is stored in Atlas')
        await atlasDb.collection(col.name).deleteMany({});
        await atlasDb.collection(col.name).insertMany(data);
        console.log(`Successfully migrated ${data.length} documents from ${col.name}.`);
      } else {
        console.log(`Collection ${col.name} is empty, skipping.`);
      }
    }

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrate();
