import IORedis from 'ioredis';
import { sendSSE } from '../controllers/sse.controller';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const pubClient = new IORedis(redisUrl, { maxRetriesPerRequest: null });
export const subClient = new IORedis(redisUrl, { maxRetriesPerRequest: null });

subClient.subscribe('USER_EVENTS', (err) => {
  if (err) console.error('Failed to subscribe to USER_EVENTS', err);
});

subClient.on('message', (channel, message) => {
  if (channel === 'USER_EVENTS') {
    try {
      const payload = JSON.parse(message);
      sendSSE(payload.userId, payload.event);
    } catch (e) {
      console.error('Failed to parse SSE payload', e);
    }
  }
});

export const publishUserEvent = async (userId: string, event: any) => {
  await pubClient.publish('USER_EVENTS', JSON.stringify({ userId: userId.toString(), event }));
};
