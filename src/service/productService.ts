import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { Color } from "../entities/Color";
import { Gender } from "../entities/Gender";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";
import { Size } from "../entities/Size";

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

    // CREATE VARIANTS
    const savedVariants = [];

    if (Array.isArray(body.variants) && body.variants.length > 0) {

      for (const item of body.variants) {

        let existingColor = null;
        let existingSize = null;

        // COLOR
        if (item.colorId) {

          existingColor = await queryRunner.manager.findOne(Color, {
            where: {
              colorId: item.colorId,
            },
          });

          if (!existingColor) {
            throw new Error(`Color not found: ${item.colorId}`);
          }
        }

        // SIZE
        if (item.sizeId) {

          existingSize = await queryRunner.manager.findOne(Size, {
            where: {
              sizeId: item.sizeId,
            },
          });

          if (!existingSize) {
            throw new Error(`Size not found: ${item.sizeId}`);
          }
        }

        // VARIANT NAME
        const variantName = [
          savedProduct.productName,
          existingColor?.name,
          existingSize?.name,
        ]
          .filter(Boolean)
          .join(" ");

        // SKU
        const sku = [
          `PRD-${savedProduct.productId}`,
          existingColor?.name?.substring(0, 3),
          existingSize?.name,
        ]
          .filter(Boolean)
          .join("-")
          .toUpperCase();

        // CHECK DUPLICATE SKU
        const existingSku = await queryRunner.manager.findOne(
          ProductVariant,
          {
            where: {
              sku,
            },
          }
        );

        if (existingSku) {
          throw new Error(`Variant already exists with SKU ${sku}`);
        }

        // CREATE VARIANT
        const variant = queryRunner.manager.create(ProductVariant, {
          product: savedProduct,

          color: existingColor || null,

          size: existingSize || null,

          name: variantName,

          sku,

          price: item.price,

          stock: item.stock,

          created_by: userId,
        });

        const savedVariant = await queryRunner.manager.save(variant);

        savedVariants.push(savedVariant);
      }
    }

    await queryRunner.commitTransaction();

    return {
      product: savedProduct,
      variants: savedVariants,
    };

  } catch (error) {

    await queryRunner.rollbackTransaction();

    throw error;

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