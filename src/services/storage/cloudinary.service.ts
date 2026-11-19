import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import {
  cloudinaryFolders,
  getCloudinaryClient,
} from "../../config/cloudinary";

export type CloudinaryUploadResult = Pick<
  UploadApiResponse,
  "secure_url" | "public_id"
>;

const uploadBuffer = (
  buffer: Buffer,
  options: UploadApiOptions,
  client: ReturnType<typeof getCloudinaryClient>,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary returned no upload result."));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

export const uploadImage = async (
  buffer: Buffer,
  folder: string = cloudinaryFolders.products,
): Promise<CloudinaryUploadResult> => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("An image buffer is required for Cloudinary upload.");
  }

  if (!folder.trim()) {
    throw new Error("A Cloudinary upload folder is required.");
  }

  const client = getCloudinaryClient();

  try {
    const result = await uploadBuffer(
      buffer,
      {
        folder,
        resource_type: "image",
        secure: true,
        unique_filename: true,
        use_filename: false,
        overwrite: false,
      },
      client,
    );

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    throw new Error("Cloudinary image upload failed.", { cause: error });
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId.trim()) {
    throw new Error("A Cloudinary public ID is required for deletion.");
  }

  const client = getCloudinaryClient();

  try {
    const result = await client.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary deletion returned: ${result.result}`);
    }
  } catch (error) {
    throw new Error("Cloudinary image deletion failed.", { cause: error });
  }
};
