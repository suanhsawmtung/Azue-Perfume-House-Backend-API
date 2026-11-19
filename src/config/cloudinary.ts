import { v2 as cloudinary } from "cloudinary";

export const cloudinaryFolders = {
  products: "azue/products",
  blogs: "azue/blogs",
  users: "azue/users",
  orders: "azue/orders",
} as const;

export type CloudinaryFolder =
  (typeof cloudinaryFolders)[keyof typeof cloudinaryFolders];

const getRequiredCloudinaryEnv = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
};

export const getCloudinaryClient = () => {
  const { cloudName, apiKey, apiSecret } = getRequiredCloudinaryEnv();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
};
