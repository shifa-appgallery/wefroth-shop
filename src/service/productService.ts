import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { Color } from "../entities/Color";
import { Gender } from "../entities/Gender";
import { Product } from "../entities/Product";
import { ProductMedia } from "../entities/ProductMedia";
import { ProductVariant } from "../entities/ProductVariant";
import { Size } from "../entities/Size";
import { VariantImage } from "../entities/VanriantImage";

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const genderRepository = AppDataSource.getRepository(Gender);

export const createProduct = async (
  body: any,
  userId: number
) => {

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log("PRODUCT MEDIA", body.product_media);
    // CHECK EXISTING PRODUCT
    const existingProduct = await queryRunner.manager.findOne(Product, {
      where: {
        productName: body.productName,
        seller_type: body.seller_type,
        seller_id: body.seller_id,
      },
    });

    if (existingProduct) {
      throw new Error("Product already exists");
    }

    // CHECK CATEGORY
    const existingCategory = await queryRunner.manager.findOne(Category, {
      where: {
        categoryId: body.categoryId,
      },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // CHECK GENDER
    const existingGender = await queryRunner.manager.findOne(Gender, {
      where: {
        genderId: body.genderId,
      },
    });

    if (!existingGender) {
      throw new Error("Gender not found");
    }

    // CREATE PRODUCT
    const product = queryRunner.manager.create(Product, {

      productName: body.productName,

      description: body.description,

      seller_type: body.seller_type,

      seller_id: body.seller_id,

      category: existingCategory,

      gender: existingGender,

      base_price: body.base_price,

      currency: body.currency || "AUD",

      created_by: userId,
    });

    const savedProduct = await queryRunner.manager.save(product);

    // =========================
    // CREATE PRODUCT MEDIA
    // =========================

    const savedProductMedia: any[] = [];

    if (
      Array.isArray(body.product_media) &&
      body.product_media.length > 0
    ) {

      for (const media of body.product_media) {
        console.log("MEDIA OBJECT =>", media);

        const productMedia = queryRunner.manager.create(ProductMedia, {

          product: savedProduct,

          media_url: media.media_url,

          media_type: media.media_type || "IMAGE",

          sort_order: media.sort_order || 1,

          is_thumbnail: media.is_thumbnail || false,

          alt_text: media.alt_text || null,

          created_by: userId,
        });

        const savedMedia =
          await queryRunner.manager.save(productMedia);

        savedProductMedia.push(savedMedia);
      }
    }

    // =========================
    // CREATE VARIANTS
    // =========================

    const savedVariants: any[] = [];

    if (
      Array.isArray(body.variants) &&
      body.variants.length > 0
    ) {

      for (const item of body.variants) {

        let existingColor = null;
        let existingSize = null;

        // CHECK COLOR
        if (item.colorId) {

          existingColor = await queryRunner.manager.findOne(Color, {
            where: {
              colorId: item.colorId,
            },
          });

          if (!existingColor) {
            throw new Error(
              `Color not found: ${item.colorId}`
            );
          }
        }

        // CHECK SIZE
        if (item.sizeId) {

          existingSize = await queryRunner.manager.findOne(Size, {
            where: {
              sizeId: item.sizeId,
            },
          });

          if (!existingSize) {
            throw new Error(
              `Size not found: ${item.sizeId}`
            );
          }
        }

        // GENERATE VARIANT NAME
        const variantName = [
          savedProduct.productName,
          existingColor?.name,
          existingSize?.name,
        ]
          .filter(Boolean)
          .join(" ");

        // GENERATE SKU
        const sku = [
          `PRD-${savedProduct.productId}`,
          existingColor?.name?.substring(0, 3),
          existingSize?.name,
        ]
          .filter(Boolean)
          .join("-")
          .toUpperCase();

        // CHECK DUPLICATE SKU
        const existingSku =
          await queryRunner.manager.findOne(ProductVariant, {
            where: {
              sku,
            },
          });

        if (existingSku) {
          throw new Error(
            `Variant already exists with SKU ${sku}`
          );
        }

        // CREATE VARIANT
        const variant = queryRunner.manager.create(
          ProductVariant,
          {

            product: savedProduct,

            color: existingColor || null,

            size: existingSize || null,

            name: variantName,

            sku,

            price: item.price,

            stock: item.stock,

            created_by: userId,
          }
        );

        const savedVariant =
          await queryRunner.manager.save(variant);

        // =========================
        // CREATE VARIANT IMAGES
        // =========================

        const savedImages: any[] = [];

        if (
          Array.isArray(item.images) &&
          item.images.length > 0
        ) {

          for (const img of item.images) {

            const variantImage =
              queryRunner.manager.create(VariantImage, {

                variant: savedVariant,

                image_url: img.image_url,

                alt_text: img.alt_text || null,

                is_active:
                  img.is_active ?? true,

                created_by: userId,
              });

            const savedImage =
              await queryRunner.manager.save(
                variantImage
              );

            savedImages.push(savedImage);
          }
        }

        savedVariants.push({
          ...savedVariant,
          images: savedImages,
        });
      }
    }

    await queryRunner.commitTransaction();

    return {
      success: true,
      message: "Product created successfully",

      data: {

        product: {
          productId: savedProduct.productId,
          productName: savedProduct.productName,
          description: savedProduct.description,
          seller_type: savedProduct.seller_type,
          seller_id: savedProduct.seller_id,
          base_price: savedProduct.base_price,
          currency: savedProduct.currency,
          is_active: savedProduct.is_active,
          created_at: savedProduct.created_at,

          category: savedProduct.category,

          gender: savedProduct.gender,
        },

        product_media: savedProductMedia.map((media) => ({
          mediaId: media.mediaId,
          media_url: media.media_url,
          media_type: media.media_type,
          sort_order: media.sort_order,
          is_thumbnail: media.is_thumbnail,
          alt_text: media.alt_text,
          video_thumbnail: media.video_thumbnail,
        })),

        variants: savedVariants.map((variant) => ({

          variantId: variant.variantId,

          name: variant.name,

          sku: variant.sku,

          price: variant.price,

          stock: variant.stock,

          color: variant.color,

          size: variant.size,

          images: variant.images?.map((img: any) => ({
            variantImageId: img.variantImageId,
            image_url: img.image_url,
            alt_text: img.alt_text,
            is_active: img.is_active,
          })) || [],
        })),
      },
    };

  } catch (error: any) {

    await queryRunner.rollbackTransaction();

    throw new Error(error.message);

  } finally {

    await queryRunner.release();
  }
};

export const getProducts = async () => {

  return await productRepository.find({
    relations: [
      "category",
      "gender",
      "variants",
      "variants.variantImages",
      "variants.color",
      "variants.size",
      "media",
      "reviews"

    ],
    where: {
      is_active: true,
    },
  });

};

export const updateProduct = async (
  productId: number,
  body: any,
  userId: number
) => {

  const existingProduct = await productRepository.findOne({
    where: { productId },
    relations: [
      "category",
      "gender",
      "variants",
      "media",
    ],
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  let category = existingProduct.category;
  let gender = existingProduct.gender;

  // CHECK CATEGORY
  if (body.categoryId) {

    const existingCategory = await categoryRepository.findOne({
      where: {
        categoryId: body.categoryId,
      },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    category = existingCategory;
  }

  // CHECK GENDER
  if (body.genderId) {

    const existingGender = await genderRepository.findOne({
      where: {
        genderId: body.genderId,
      },
    });

    if (!existingGender) {
      throw new Error("Gender not found");
    }

    gender = existingGender;
  }

  await productRepository.update(productId, {

    productName:
      body.productName ??
      existingProduct.productName,

    description:
      body.description ??
      existingProduct.description,

    base_price:
      body.base_price ??
      existingProduct.base_price,

    currency:
      body.currency ??
      existingProduct.currency,

    category: category,

    gender: gender,

    updated_by: userId,
  });

  return await productRepository.findOne({
    where: {
      productId,
    },
    relations: [
      "category",
      "gender",
      "variants",
      "media",
    ],
  });
};

export const deleteProduct = async (productId: string) => {
  await productRepository.update(productId, {
    is_active: false,
  });

  return true;
};