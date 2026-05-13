import { AppDataSource } from "../config/data-source";
import { ProductVariant } from "../entities/ProductVarient";

const variantRepository = AppDataSource.getRepository(ProductVariant);

export const createVariant = async (body: any, userId:number) => {
  const variant = variantRepository.create({
    product: {
      productId: body.productId,
    },
    name: body.name,
    sku: body.sku,
    price: body.price,
    stock: body.stock,
    attributes: body.attributes,
    created_by: userId,
  });

  return await variantRepository.save(variant);
};

export const getVariants = async () => {
  return await variantRepository.find({
    relations: ["product"],
  });
};

export const updateVariant = async (
  variantId: string,
  body: any,
  userId:number
) => {
  await variantRepository.update(variantId, {
    name: body.name,
    sku: body.sku,
    price: body.price,
    stock: body.stock,
    attributes: body.attributes,
    updated_by: userId,

  });

  return await variantRepository.findOne({
    where: { variantId },
  });
};

export const deleteVariant = async (variantId: string) => {
  await variantRepository.delete(variantId);

  return true;
};