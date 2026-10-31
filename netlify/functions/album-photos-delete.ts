import { Handler } from '@netlify/functions';
import { getDatabase } from './lib/mongodb';
const cloudinary = require('cloudinary').v2;

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || process.env.VITE_ADMIN_PASSCODE || 'admin2410';
const GALLERY_USERNAME = (process.env.GALLERY_USERNAME || '').trim();
const GALLERY_PASSWORD = (process.env.GALLERY_PASSWORD || '').trim();
const EXPECTED_GALLERY_TOKEN = GALLERY_USERNAME && GALLERY_PASSWORD ? Buffer.from(`${GALLERY_USERNAME}:${GALLERY_PASSWORD}`).toString('base64') : '';

const isAuthorizedRequest = (authHeader?: string) => {
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  return authHeader === `Bearer ${ADMIN_PASSCODE}` || (!!EXPECTED_GALLERY_TOKEN && token === EXPECTED_GALLERY_TOKEN);
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler: Handler = async (event) => {
  const authHeader = event.headers.authorization;
  if (!isAuthorizedRequest(authHeader)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { id, storage_path } = JSON.parse(event.body || '{}');

    const db = await getDatabase();

    // Delete from Cloudinary if storage_path exists
    if (storage_path) {
      try {
        await cloudinary.uploader.destroy(storage_path);
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
    }

    // Delete from database
    await db.collection('album_photos').deleteOne({ _id: id });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error deleting album photo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Delete failed' }),
    };
  }
};
