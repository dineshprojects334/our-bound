import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'our-bound';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
  }

  const isConnected =
    typeof client.topology?.isConnected === 'function'
      ? client.topology.isConnected()
      : false;

  if (!isConnected) {
    await client.connect();
  }

  db = client.db(MONGODB_DB_NAME);
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
