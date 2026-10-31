import { Handler } from '@netlify/functions';
import { v2 as cloudinary } from 'cloudinary';

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

  // POST - Upload file (expecting base64 data)
  if (event.httpMethod === 'POST') {
    try {
      const { file, fileName, fileType } = JSON.parse(event.body || '{}');

      if (!file) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'No file provided' }),
        };
      }

      // Upload base64 to Cloudinary
      const result = await cloudinary.uploader.upload(file, {
        folder: 'our-bound/memories',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        max_file_size: 15000000, // 15MB
        public_id: `memories/${Date.now()}_${Math.random().toString(36).substring(7)}`,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          path: result.public_id,
          url: result.secure_url,
        }),
      };
    } catch (error) {
      console.error('Error uploading:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Upload failed', details: error.message }),
      };
    }
  }

  // DELETE - Delete file
  if (event.httpMethod === 'DELETE') {
    try {
      const { path } = JSON.parse(event.body || '{}');
      if (!path) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'No path provided' }),
        };
      }

      await cloudinary.uploader.destroy(path);

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } catch (error) {
      console.error('Error deleting:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Delete failed' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
