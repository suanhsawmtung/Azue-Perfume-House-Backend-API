import redisClient, { connectRedis } from "../config/redis";

const ensureRedis = async () => {
  if (!redisClient.isOpen) {
    await connectRedis();
  }
};

export const createCache = async (
  cacheName: string,
  content: string = Date.now().toString()
) => {
  await ensureRedis();
  await redisClient.set(cacheName, content);
};

export const removeCache = async (cacheName: string) => {
  await ensureRedis();
  await redisClient.del(cacheName);
};

export const hasCache = async (cacheName: string): Promise<boolean> => {
  await ensureRedis();
  return (await redisClient.exists(cacheName)) === 1;
};

export const readCache = async (cacheName: string): Promise<string | null> => {
  await ensureRedis();
  return redisClient.get(cacheName);
};
