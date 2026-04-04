import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

export const redisClient = new Redis(process.env.REDIS_HOST as string);

redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});
