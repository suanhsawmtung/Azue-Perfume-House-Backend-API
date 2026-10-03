import "dotenv/config";
import { app } from "./app";
import { env } from "./config/env";
import redisClient, { connectRedis } from "./config/redis";

const PORT = env.port;

app.listen(PORT, async () => {
  console.log(`Your express server is listening at port:${PORT}`);
  await connectRedis();
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n👋 Received ${signal}. Starting graceful shutdown...`);

  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    console.log("👍 Clean exit accomplished.");
    process.exit(0);
  } catch (err) {
    console.error("💥 Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
