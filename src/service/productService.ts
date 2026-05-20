import { AppDataSource } from "../config/data-source";
import { Gender } from "../constants/enums";
import { Product } from "../entities/Product";

const productRepository = AppDataSource.getRepository(Product);

export const createProduct = async (
  body: any,
  userId: number
) => {

  // CHECK EXISTING PRODUCT
  const existingProduct = await productRepository.findOne({
    where: {
      productName: body.productName,
      seller_type: body.seller_type,
      seller_id: body.seller_id,
    },
  });

  if (existingProduct) {
    throw new Error("Product already exists");
  }

  const product = productRepository.create({
    productName: body.productName,
    description: body.description,

    seller_type: body.seller_type,
    seller_id: body.seller_id,

    category: {
      categoryId: body.categoryId,
    },

    base_price: body.base_price,

    gender: body.gender || Gender.ALL,

    currency: body.currency || "AUD",

    created_by: userId,
  });

  return await productRepository.save(product);
};

export const getProducts = async () => {
  return await productRepository.find({
    relations: ["category", "variants", "media"],
    where: {
      is_active: true,
    },
  });
};

export const updateProduct = async (
  productId: string,
  body: any,
  userId: number
) => {

  const existingProduct = await productRepository.findOne({
    where: { productId },
    relations: ["category", "variants", "media"],
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }
console.log("gender",body.gender)
  await productRepository.update(productId, {

    productName:
      body.productName ?? existingProduct.productName,

    description:
      body.description ?? existingProduct.description,

    base_price:
      body.base_price ?? existingProduct.base_price,

    currency:
      body.currency ?? existingProduct.currency,

    gender:
      body.gender ?? existingProduct.gender,

    category: body.categoryId
      ? { categoryId: body.categoryId }
      : existingProduct.category,

    updated_by: userId,
  });

  return await productRepository.findOne({
    where: { productId },
    relations: ["category", "variants", "media"],
  });
};

export const deleteProduct = async (productId: string) => {
  await productRepository.update(productId, {
    is_active: false,
  });

  return true;
};