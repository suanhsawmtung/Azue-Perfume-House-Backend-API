import "dotenv/config";

export const env = {
  port: process.env.PORT || 8080,
  appEnv: process.env.APP_ENV || "development",
  emailProvider: process.env.EMAIL_PROVIDER || "log",
  storageProvider: process.env.STORAGE_PROVIDER || "local",
  resendApiKey: process.env.RESEND_API_KEY || "resend-api-key",
  resendFromEmail:
    process.env.RESEND_FROM_EMAIL || "Azue Perfume <onboarding@resend.dev>",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [],
  googleClientId: process.env.GOOGLE_CLIENT_ID || "google-client-id",
  googleClientSecret:
    process.env.GOOGLE_CLIENT_SECRET || "google-client-secret",
  serverUrl: process.env.SERVER_URL || "http://localhost:8080",
  webUrl: process.env.WEB_URL || "http://localhost:5173",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  databaseUrl: process.env.DATABASE_URL || "",
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET_KEY || "access_secret",
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET_KEY || "refresh_secret",
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucketName: process.env.R2_BUCKET_NAME || "",
    publicUrl: process.env.R2_PUBLIC_URL?.trim().replace(/\/+$/, "") || "",
  },
};
