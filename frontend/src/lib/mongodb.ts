import { MongoClient } from "mongodb";

const mongoUri = process.env.DATABASE_URL;

if (!mongoUri) {
  throw new Error("DATABASE_URL is not set");
}

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

const client = new MongoClient(mongoUri);

const mongoClientPromise = globalForMongo.mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClientPromise = mongoClientPromise;
}

export async function getDb() {
  const connectedClient = await mongoClientPromise;
  return connectedClient.db();
}