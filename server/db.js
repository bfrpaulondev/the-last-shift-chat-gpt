import mongoose from 'mongoose'

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/thelastshift'

export async function connectMongo() {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return
  }

  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    })
  } catch {
    // MongoDB is optional for local gameplay. Routes return 503 while offline.
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1
}
