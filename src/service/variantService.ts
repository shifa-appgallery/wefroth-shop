import { AppDataSource } from "../config/data-source";
import { Color } from "../entities/Color";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";
import { Size } from "../entities/Size";

const variantRepository = AppDataSource.getRepository(ProductVariant);
const productRepository = AppDataSource.getRepository(Product);
const colorRepository = AppDataSource.getRepository(Color);
const sizeRepository = AppDataSource.getRepository(Size);

export const createVariant = async (
  body: any,
  userId: number
) => {

  // check product
  const existingProduct = await productRepository.findOne({
    where: {
      productId: body.productId,
    },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // check color
  const existingColor = await colorRepository.findOne({
    where: {
      colorId: body.colorId,
    },
  });

  if (!existingColor) {
    throw new Error("Color not found");
  }

  // check size
  const existingSize = await sizeRepository.findOne({
    where: {
      sizeId: body.sizeId,
    },
  });

  if (!existingSize) {
    throw new Error("Size not found");
  }

  // check sku duplicate
  const existingSku = await variantRepository.findOne({
    where: {
      sku: body.sku,
    },
  });

  if (existingSku) {
    throw new Error("SKU already exists");
  }

  const variant = variantRepository.create({
    product: existingProduct,
    color: existingColor,
    size: existingSize,
    name: body.name,
    sku: body.sku,
    price: body.price,
    stock: body.stock,
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
  variantId: number,
  body: any,
  userId: number
) => {

  const existingVariant = await variantRepository.findOne({
    where: {
      variantId,
    },
    relations: ["product", "color", "size"],
  });

  if (!existingVariant) {
    throw new Error("Variant not found");
  }

  let color = existingVariant.color;
  let size = existingVariant.size;

  // update color
  if (body.colorId) {

    const existingColor = await colorRepository.findOne({
      where: {
        colorId: body.colorId,
      },
    });

    if (!existingColor) {
      throw new Error("Color not found");
    }

    color = existingColor;
  }

  // update size
  if (body.sizeId) {

    const existingSize = await sizeRepository.findOne({
      where: {
        sizeId: body.sizeId,
      },
    });

    if (!existingSize) {
      throw new Error("Size not found");
    }

    size = existingSize;
  }

  await variantRepository.update(variantId, {
    name: body.name ?? existingVariant.name,
    sku: body.sku ?? existingVariant.sku,
    price: body.price ?? existingVariant.price,
    stock: body.stock ?? existingVariant.stock,
    color,
    size,
    updated_by: userId,
  });

  return await variantRepository.findOne({
    where: {
      variantId,
    },
    relations: ["product", "color", "size"],
  });
};

export const deleteVariant = async (variantId: string) => {
  await variantRepository.delete(variantId);

  return true;
};