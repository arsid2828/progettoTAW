// Configurazione client Redis
import { Redis } from 'ioredis';
export const redis = new Redis({
  host: 'redis',
  port: 6379,
  retryStrategy: times => Math.min(times * 50, 2000),
});