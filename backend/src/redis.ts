import { Redis } from 'ioredis';
export const redis = new Redis({
  host: 'localhost',        // nome del container, non localhost!
  port: 6379,
});