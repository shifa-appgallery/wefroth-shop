import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { Gender } from "../entities/Gender";
import { Product } from "../entities/Product";

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const genderRepository = AppDataSource.getRepository(Gender);


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

  // CHECK CATEGORY
  const existingCategory = await categoryRepository.findOne({
    where: {
      categoryId: body.categoryId,
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  // CHECK GENDER
  const existingGender = await genderRepository.findOne({
    where: {
      genderId: body.genderId,
    },
  });

  if (!existingGender) {
    throw new Error("Gender not found");
  }

  const product = productRepository.create({
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

  return await productRepository.save(product);
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