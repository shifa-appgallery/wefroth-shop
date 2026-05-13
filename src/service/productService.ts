import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/Product";

const productRepository = AppDataSource.getRepository(Product);

export const createProduct = async (body: any, userId: number) => {
  const product = productRepository.create({
    productName: body.productName,
    description: body.description,
    seller_type: body.seller_type,
    seller_id: body.seller_id,
    category: {
      categoryId: body.categoryId,
    },
    base_price: body.base_price,
    currency: body.currency || "AUD",
    created_by: userId,
  });

  return await productRepository.save(product);
};

export const getProducts = async () => {
  return await productRepository.find({
    relations: ["category", "variants", "images"],
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
  await productRepository.update(productId, {
    productName: body.productName,
    description: body.description,
    base_price: body.base_price,
    currency: body.currency,
    updated_by: userId,
  });

  return await productRepository.findOne({
    where: { productId },
    relations: ["category", "variants", "images"],
  });
};

export const deleteProduct = async (productId: string) => {
  await productRepository.update(productId, {
    is_active: false,
  });

  return true;
};