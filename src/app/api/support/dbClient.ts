import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
let db: any;

async function storeSyncHistory(
  shopifyData: any,
  xeroData: any,
  analysis: any,
  actions: any
) {
  if (!db) {
    db = await connectMongo();
  }
  const syncCollection = db.collection("syncHistory");
  await syncCollection.insertOne({
    shopifyData,
    xeroData,
    analysis,
    actions,
    timestamp: new Date(),
  });
}

async function connectMongo() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    return client.db("syncDb");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

async function getLatestSyncHistory() {
  if (!db) {
    db = await connectMongo();
  }
  const syncCollection = db.collection("syncHistory");
  return await syncCollection.findOne({}, { sort: { timestamp: -1 } });
}

if (!db) {
  db = await connectMongo();
}

export { getLatestSyncHistory, connectMongo, db, storeSyncHistory };
