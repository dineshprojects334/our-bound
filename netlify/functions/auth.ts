import { Handler } from '@netlify/functions';

const GALLERY_USERNAME = (process.env.GALLERY_USERNAME || '').trim();
const GALLERY_PASSWORD = (process.env.GALLERY_PASSWORD || '').trim();

export function buildGalleryToken(username: string, password: string): string {
  return Buffer.from(`${username}:${password}`).toString('base64');
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!GALLERY_USERNAME || !GALLERY_PASSWORD) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gallery credentials are not configured on the server.' }),
    };
  }

  try {
    const { username = '', password = '' } = JSON.parse(event.body || '{}');
    const cleanUser = typeof username === 'string' ? username.trim() : '';
    const cleanPass = typeof password === 'string' ? password.trim() : '';

    if (cleanUser !== GALLERY_USERNAME || cleanPass !== GALLERY_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid username or password.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        token: buildGalleryToken(cleanUser, cleanPass),
        username: cleanUser,
      }),
    };
  } catch (error) {
    console.error('Gallery auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed' }),
    };
  }
};
