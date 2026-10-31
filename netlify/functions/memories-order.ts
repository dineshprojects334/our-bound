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
  const authHeader = event.headers.authorization;
  if (!isAuthorizedRequest(authHeader)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  if (event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { id, display_order } = JSON.parse(event.body || '{}');

    const db = await getDatabase();
    const result = await db.collection('memories').updateOne(
      { _id: id },
      {
        $set: {
          display_order,
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

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update order' }),
    };
  }
};
