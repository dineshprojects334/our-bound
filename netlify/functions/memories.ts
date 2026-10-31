import { Handler } from '@netlify/functions';
import { v2 as cloudinary } from 'cloudinary';
import { getDatabase } from './lib/mongodb';

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || process.env.VITE_ADMIN_PASSCODE || 'admin2410';
const GALLERY_USERNAME = (process.env.GALLERY_USERNAME || '').trim();
const GALLERY_PASSWORD = (process.env.GALLERY_PASSWORD || '').trim();
const EXPECTED_GALLERY_TOKEN = GALLERY_USERNAME && GALLERY_PASSWORD ? Buffer.from(`${GALLERY_USERNAME}:${GALLERY_PASSWORD}`).toString('base64') : '';

const isAuthorizedRequest = (authHeader?: string) => {
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  return authHeader === `Bearer ${ADMIN_PASSCODE}` || (!!EXPECTED_GALLERY_TOKEN && token === EXPECTED_GALLERY_TOKEN);
};

export const handler: Handler = async (event) => {
  // Verify authenticated gallery request for all write operations
  if (event.httpMethod !== 'GET') {
    const authHeader = event.headers.authorization;
    if (!isAuthorizedRequest(authHeader)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }
  }

  try {
    const db = await getDatabase();
    const collection = db.collection('memories');

    // GET - Fetch single memory (not used in current app, but for completeness)
    if (event.httpMethod === 'GET') {
      const id = event.path.split('/').pop();
      const memory = await collection.findOne({ _id: id });
      if (!memory) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Memory not found' }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(memory),
      };
    }

    // POST - Create new memory
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const newMemory = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const result = await collection.insertOne(newMemory);
      return {
        statusCode: 201,
        body: JSON.stringify({ ...newMemory, _id: result.insertedId }),
      };
    }

    // PUT - Update memory
    if (event.httpMethod === 'PUT') {
      const id = event.path.split('/').pop();
      const data = JSON.parse(event.body || '{}');
      const result = await collection.updateOne(
        { _id: id },
        {
          $set: {
            ...data,
            updated_at: new Date().toISOString(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Memory not found' }),
        };
      }

      const updated = await collection.findOne({ _id: id });
      return {
        statusCode: 200,
        body: JSON.stringify(updated),
      };
    }

    // DELETE - Delete memory
    if (event.httpMethod === 'DELETE') {
      const id = event.path.split('/').pop();
      const memory = await collection.findOne({ _id: id });

      if (!memory) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Memory not found' }),
        };
      }

      // Delete from Cloudinary if storage_path exists
      if (memory.storage_path) {
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
          await cloudinary.uploader.destroy(memory.storage_path);
        } catch (err) {
          console.error('Error deleting from Cloudinary:', err);
        }
      }

      await collection.deleteOne({ _id: id });
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error in memories handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
