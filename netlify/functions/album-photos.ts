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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handler: Handler = async (event) => {
  // GET - Fetch all album photos
  if (event.httpMethod === 'GET') {
    try {
      const db = await getDatabase();
      const photos = await db
        .collection('album_photos')
        .find({})
        .sort({ created_at: -1 })
        .toArray();

      return {
        statusCode: 200,
        body: JSON.stringify(photos),
      };
    } catch (error) {
      console.error('Error fetching album photos:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch photos' }),
      };
    }
  }

  // POST - Upload photo
  if (event.httpMethod === 'POST') {
    const authHeader = event.headers.authorization;
    if (!isAuthorizedRequest(authHeader)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    try {
      const { file, caption } = JSON.parse(event.body || '{}');

      if (!file) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'No file provided' }),
        };
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file, {
        folder: 'our-bound/album',
        resource_type: 'image',
        public_id: `album/${Date.now()}_${Math.random().toString(36).substring(7)}`,
      });

      // Save to database
      const db = await getDatabase();
      const newPhoto = {
        src: result.secure_url,
        caption: caption || '',
        storage_path: result.public_id,
        created_at: new Date().toISOString(),
      };

      const insertResult = await db.collection('album_photos').insertOne(newPhoto);

      return {
        statusCode: 201,
        body: JSON.stringify({ ...newPhoto, _id: insertResult.insertedId }),
      };
    } catch (error) {
      console.error('Error uploading album photo:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Upload failed' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
