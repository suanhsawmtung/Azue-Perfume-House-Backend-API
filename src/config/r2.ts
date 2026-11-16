import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

const getRequiredEnv = (value: string): string => {
  if (!value) {
    throw new Error(`R2 configuration is missing. Please ensure that the following environment variables are set:
- R2_ACCOUNT_ID
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET_NAME
- R2_PUBLIC_URL`);
  }

  return value;
};

export const normalizeR2PublicUrl = (publicUrl: string): string =>
  publicUrl.trim().replace(/\/+$/, "");

export const getR2Config = (): R2Config => ({
  accountId: getRequiredEnv(env.r2.accountId),
  accessKeyId: getRequiredEnv(env.r2.accessKeyId),
  secretAccessKey: getRequiredEnv(env.r2.secretAccessKey),
  bucketName: getRequiredEnv(env.r2.bucketName),
  publicUrl: normalizeR2PublicUrl(getRequiredEnv(env.r2.publicUrl)),
});

export const createR2Client = (config: R2Config = getR2Config()): S3Client =>
  new S3Client({
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    region: "auto",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
