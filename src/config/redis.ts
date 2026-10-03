import { createClient } from "redis";
import { env } from "./env";

const redisClient = createClient({
  url: env.redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("❌ Redis: Max reconnection retries reached. Stopping.");
        return new Error("Redis connection lost permanently.");
      }

      const delay = Math.min(retries * 50, 2000);
      console.warn(
        `🔄 Redis: Connection lost. Retrying in ${delay}ms... (Attempt ${retries})`,
      );
      return delay;
    },
  },
});

redisClient.on("connect", () => {
  console.log("🔌 Redis: Connecting to server...");
});

redisClient.on("ready", () => {
  console.log("🚀 Redis: Connected successfully and ready to use!");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redisClient.on("end", () => {
  console.log("🛑 Redis: Connection closed.");
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("❌ Redis: Initial connection failed:", error);
  }
};

export default redisClient;
