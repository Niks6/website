import { MongoClient } from "mongodb"

let cachedClient = null

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  cachedClient = client
  return client
}

export async function getDatabase(dbName = "gupta-electronics") {
  const client = await connectToDatabase()
  return client.db(dbName)
}
