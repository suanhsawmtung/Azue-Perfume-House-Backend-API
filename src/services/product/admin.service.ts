import { Prisma, Product, ProductVariant } from "@prisma/client";
import { stringify } from "csv-stringify/sync";
import { errorCode } from "../../config/error-code";
import { ProductDto } from "../../dtos/product.dto";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
  AdminListProductResultT,
  AdminProductDetailT,
  CreateProductParams,
  CreateProductVariantParams,
  ListProductsParams,
  ProductVariantDetailType,
  UpdateProductNewParams,
  UpdateProductVariantParams,
} from "../../types/product";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import { deleteStoredFile } from "../storage/storage-reference";
import {
  buildProductWhere,
  deleteProductRecord,
  deleteProductVariantFully,
  findAdminProductDetail,
  findProductByName,
  findProductByNameExcludingId,
  findProductBySlug,
  findProductVariantBySlug,
  findProductVariantDetail,
  findVariantImages,
  generateUniqueVariantSku,
  generateUniqueVariantSlug,
  insertProduct,
  parseProductQueryParams,
  requireSlug,
  requireVariantSlug,
  updateProductRecord,
} from "./product.helpers";
import { IAdminProductService } from "./product.interface";

const MAX_VARIANT_DECIMAL = 99999999.99;

const parseVariantDecimal = (value: number | string, fieldName: string): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_VARIANT_DECIMAL) {
    throw createError({
      message: `${fieldName} must be between 0 and ${MAX_VARIANT_DECIMAL}.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  return parsed;
};

export class AdminProductService implements IAdminProductService {
  async listProducts(
    params: ListProductsParams,
  ): Promise<ServiceResponseT<AdminListProductResultT>> {
    const {
      pageSize,
      offset,
      search,
      brandSlug,
      gender,
      concentration,
      isActive,
      isLimited,
    } = parseProductQueryParams(params);

    const where = buildProductWhere({
      search,
      brandSlug,
      gender,
      concentration,
      isActive,
      isLimited,
    });

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          brand: {
            select: { name: true },
          },
          _count: {
            select: { variants: { where: { deletedAt: null } } },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as any[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async exportProducts(params: ListProductsParams): Promise<string> {
    const {
      search,
      brandSlug,
      gender,
      concentration,
      isActive,
      isLimited,
    } = parseProductQueryParams(params);

    const where = buildProductWhere({
      search,
      brandSlug,
      gender,
      concentration,
      isActive,
      isLimited,
    });

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        brand: {
          select: { name: true },
        },
        variants: {
          where: { deletedAt: null },
          orderBy: { size: "asc" },
          select: {
            size: true,
            sku: true,
            price: true,
            stock: true,
            isActive: true,
          },
        },
      },
    });

    const rows = products.flatMap(ProductDto.toProductCsvRows);

    return stringify(rows, {
      header: true,
      columns: [
        "product_name",
        "brand_name",
        "variant_name",
        "sku",
        "price",
        "stock_quantity",
        "product_status",
        "variant_status",
      ],
    });
  }

  async getProductDetail(
    slug: string,
  ): Promise<ServiceResponseT<AdminProductDetailT>> {
    const normalizedSlug = requireSlug(slug);
    const product = await findAdminProductDetail(normalizedSlug);

    if (!product) {
      throw createError({
        message: "Product not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: product,
      message: null,
    };
  }

  async createProduct(
    params: CreateProductParams,
  ): Promise<ServiceResponseT<Product>> {
    const {
      name,
      description,
      concentration,
      gender,
      brandId,
      isActive,
      isLimited,
      releasedYear,
    } = params;

    const trimmedName = name.trim();
    const existing = await findProductByName(trimmedName);
    if (existing) {
      throw createError({
        message: "Product with this name already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const baseSlug = createSlug(trimmedName);
    const slugOwner = await findProductBySlug(baseSlug);
    const slugExists = !!slugOwner;
    const slug = await ensureUniqueSlug(baseSlug, slugExists);

    const createData: Prisma.ProductCreateInput = {
      name: trimmedName,
      slug,
      description,
      concentration,
      gender,
      releasedYear: releasedYear ? Number(releasedYear) : null,
      brand: { connect: { id: Number(brandId) } },
    };

    if (isActive !== undefined) createData.isActive = isActive;
    if (isLimited !== undefined) createData.isLimited = isLimited;

    const product = await insertProduct(createData);

    return {
      success: true,
      data: product,
      message: "Product created successfully.",
    };
  }

  async updateProduct(
    slug: string,
    params: UpdateProductNewParams,
  ): Promise<ServiceResponseT<Product>> {
    const {
      name,
      description,
      concentration,
      gender,
      brandId,
      isActive,
      isLimited,
      releasedYear,
    } = params;

    const normalizedSlug = requireSlug(slug);
    const existing = await findProductBySlug(normalizedSlug);
    if (!existing) {
      throw createError({
        message: "Product not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const trimmedName = name.trim();
    const existingByName = await findProductByNameExcludingId(
      trimmedName,
      existing.id,
    );
    if (existingByName) {
      throw createError({
        message: "Product with this name already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const baseSlug = createSlug(trimmedName);
    const slugOwner = await findProductBySlug(baseSlug);
    const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
    const slugValue = await ensureUniqueSlug(baseSlug, slugExists);

    const updateData: Prisma.ProductUpdateInput = {
      name: trimmedName,
      slug: slugValue,
      description,
      concentration,
      gender,
      releasedYear: releasedYear ? Number(releasedYear) : null,
      brand: { connect: { id: Number(brandId) } },
    };

    if (isActive !== undefined) updateData.isActive = isActive;
    if (isLimited !== undefined) updateData.isLimited = isLimited;

    const product = await updateProductRecord(existing.id, updateData);

    return {
      success: true,
      data: product,
      message: "Product updated successfully.",
    };
  }

  async deleteProduct(slug: string): Promise<ServiceResponseT<null>> {
    const normalizedSlug = requireSlug(slug);
    const product = await findProductBySlug(normalizedSlug);

    if (!product) {
      throw createError({
        message: "Product not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    await deleteProductRecord(product.id);

    return {
      success: true,
      data: null,
      message: "Product deleted successfully.",
    };
  }

  async createVariant(
    params: CreateProductVariantParams,
  ): Promise<ServiceResponseT<ProductVariant>> {
    const {
      productId,
      size,
      price,
      discount,
      imageFilenames,
      imagePublicIds,
      isPrimary,
      isActive,
    } = params;

    if (!productId) {
      throw createError({
        message: "Product ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId), deletedAt: null },
    });

    if (!product) {
      throw createError({
        message: "Product not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const variantSize = Number(size);
    const variantPrice = parseVariantDecimal(price, "Price");
    const variantDiscount =
      discount !== undefined ? parseVariantDecimal(discount, "Discount") : 0;

    const skuFinal = await generateUniqueVariantSku(
      Number(productId),
      variantSize,
    );

    const slug = await generateUniqueVariantSlug(product.slug, variantSize);

    const variant = await prisma.$transaction(async (tx) => {
      const newVariant = await tx.productVariant.create({
        data: {
          productId: Number(productId),
          sku: skuFinal,
          slug,
          size: variantSize,
          price: variantPrice,
          discount: variantDiscount,
          isPrimary: !!isPrimary,
          isActive: isActive !== undefined ? !!isActive : true,
        },
      });

      if (isPrimary) {
        await tx.productVariant.updateMany({
          where: {
            productId: Number(productId),
            isPrimary: true,
            id: { not: newVariant.id },
          },
          data: { isPrimary: false },
        });
      }

      if (imageFilenames && imageFilenames.length > 0) {
        await tx.image.createMany({
          data: imageFilenames.map((filename, index) => ({
            path: filename,
            publicId: imagePublicIds?.[index] || null,
            isPrimary: index === 0,
            order: index,
            productVariantId: newVariant.id,
          })),
        });
      }

      await tx.inventory.create({
        data: {
          productVariantId: newVariant.id,
          quantity: 0,
        },
      });

      return newVariant;
    });

    return {
      success: true,
      data: variant,
      message: "Variant created successfully.",
    };
  }

  async updateVariant(
    variantSlug: string,
    params: UpdateProductVariantParams,
  ): Promise<ServiceResponseT<ProductVariant>> {
    const {
      size,
      price,
      discount,
      imageFilenames,
      imagePublicIds,
      imageLayout,
      isPrimary,
      isActive,
    } = params;

    const normalizedSlug = requireVariantSlug(variantSlug);
    const existing = await findProductVariantBySlug(normalizedSlug);

    if (!existing) {
      throw createError({
        message: "Product variant not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const variantSize = size ? Number(size) : existing.size;
    let imagesToDelete: { id: number; path: string; publicId: string | null }[] = [];

    let slug = existing.slug;
    if (variantSize !== existing.size) {
      const product = await prisma.product.findUnique({
        where: { id: existing.productId },
      });
      if (product) {
        slug = await generateUniqueVariantSlug(
          product.slug,
          variantSize,
          existing.id,
        );
      }
    }

    const variant = await prisma.$transaction(async (tx) => {
      const updateData: Prisma.ProductVariantUpdateInput = {
        size: variantSize,
        slug,
      };

      if (price !== undefined) {
        updateData.price = parseVariantDecimal(price, "Price");
      }
      if (discount !== undefined) {
        updateData.discount = parseVariantDecimal(discount, "Discount");
      }
      if (isPrimary !== undefined) updateData.isPrimary = !!isPrimary;
      if (isActive !== undefined) updateData.isActive = !!isActive;

      const updatedVariant = await tx.productVariant.update({
        where: { id: existing.id },
        data: updateData,
      });

      if (isPrimary) {
        await tx.productVariant.updateMany({
          where: {
            productId: existing.productId,
            isPrimary: true,
            id: { not: existing.id },
          },
          data: { isPrimary: false },
        });
      }

      // Image Management Logic (Syncing existing and new files)
      if (imageLayout) {
        const currentImages = await tx.image.findMany({
          where: { productVariantId: existing.id },
        });

        imagesToDelete = currentImages.filter(
          (img) => !imageLayout.includes(img.path),
        );

        if (imagesToDelete.length > 0) {
          await tx.image.deleteMany({
            where: { id: { in: imagesToDelete.map((i) => i.id) } },
          });
        }

        const newImages =
          imageFilenames?.filter(
            (filename) => !currentImages.some((img) => img.path === filename),
          ) || [];

        // Re-order and sync
        for (let i = 0; i < imageLayout.length; i++) {
          const isNew = imageLayout[i] === "__NEW__";

          if (!isNew) continue;

          const path = newImages.shift();
          if (!path) continue;

          await tx.image.create({
            data: {
              path,
              publicId: imagePublicIds?.[imageFilenames?.indexOf(path) ?? -1] || null,
              isPrimary: i === 0,
              order: i,
              productVariantId: existing.id,
            },
          });
        }
      }

      return updatedVariant;
    });

    // Remote object deletion must happen after the DB transaction. A
    // transient R2 connection failure must not roll back the variant update
    // or keep a database transaction open for the network retry window.
    for (const image of imagesToDelete) {
      await deleteStoredFile(image.path, image.publicId, "product");
    }

    return {
      success: true,
      data: variant,
      message: "Variant updated successfully.",
    };
  }

  async deleteVariant(variantSlug: string): Promise<ServiceResponseT<null>> {
    const normalizedSlug = requireVariantSlug(variantSlug);
    const variant = await findProductVariantBySlug(normalizedSlug);

    if (!variant) {
      throw createError({
        message: "Product variant not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const images = await findVariantImages(variant.id);
    await deleteProductVariantFully(variant.id);

    if (images.length > 0) {
      for (const img of images) {
        await deleteStoredFile(img.path, img.publicId, "product");
      }
    }

    return {
      success: true,
      data: null,
      message: "Variant deleted successfully.",
    };
  }

  async getVariantDetail(
    variantSlug: string,
  ): Promise<ServiceResponseT<ProductVariantDetailType>> {
    const normalizedSlug = requireVariantSlug(variantSlug);
    const variant = await findProductVariantDetail(normalizedSlug);

    if (!variant) {
      throw createError({
        message: "Variant not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: variant,
      message: null,
    };
  }
}
