import { cloudinaryFolders } from "../../../config/cloudinary";
import { deleteImage, uploadImage } from "../cloudinary.service";
import {
  StorageCategory,
  StorageFile,
  StorageProvider,
  StorageResult,
} from "../storage.interface";

const cloudinaryFolderByCategory: Record<StorageCategory, string> = {
  post: cloudinaryFolders.blogs,
  product: cloudinaryFolders.products,
  user: cloudinaryFolders.users,
  order: cloudinaryFolders.orders,
};

export class CloudinaryStorageProvider implements StorageProvider {
  async uploadFile(
    file: StorageFile,
    category: StorageCategory,
  ): Promise<StorageResult> {
    const result = await uploadImage(
      file.buffer,
      cloudinaryFolderByCategory[category],
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async deleteFile(identifier: string): Promise<void> {
    await deleteImage(identifier);
  }
}
