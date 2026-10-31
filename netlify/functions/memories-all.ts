import { Handler } from '@netlify/functions';
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
  // Verify authenticated gallery request
  const authHeader = event.headers.authorization;
  if (!isAuthorizedRequest(authHeader)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const db = await getDatabase();
    const memories = await db
      .collection('memories')
      .find({})
      .sort({ display_order: 1 })
      .toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(memories),
    };
  } catch (error) {
    console.error('Error fetching all memories:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch memories' }),
    };
  }
};
