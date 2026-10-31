import { Handler } from '@netlify/functions';
import { getDatabase } from './lib/mongodb';

export const handler: Handler = async (event) => {
  // Only allow GET requests
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
      .find({ published: true })
      .sort({ display_order: 1 })
      .toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(memories),
    };
  } catch (error) {
    console.error('Error fetching published memories:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch memories' }),
    };
  }
};
