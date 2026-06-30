import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: new URL('./.env', import.meta.url) });

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not set in environment');
  }

  await mongoose.connect(MONGODB_URI);

  console.log('Connected to MongoDB');

  // One-time fix for duplicate username error
  try {
    const managers = mongoose.connection.collection('managers');
    const indexes = await managers.indexes();
    if (indexes.find(idx => idx.name === 'username_1')) {
      await managers.dropIndex('username_1');
      console.log('✅ Successfully dropped duplicate username index');
    }
  } catch (err) {
    // Silently continue if index doesn't exist or other minor issues
    console.debug('Index cleanup:', err.message);
  }
}

// seedDB is intentionally a no-op. We do not pre-populate the database
// with mock/domain data. Records will be created only when users submit
// forms or through API calls. This prevents accidental test data from
// appearing in the production DB.
export async function seedDB() {
  // No seeding performed. Intentionally left blank.
  return;
}
