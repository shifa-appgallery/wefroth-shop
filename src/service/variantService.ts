import { AppDataSource } from "../config/data-source";
import { Color } from "../entities/Color";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";
import { Size } from "../entities/Size";
import { VariantImage } from "../entities/VanriantImage";

const variantRepository = AppDataSource.getRepository(ProductVariant);
const productRepository = AppDataSource.getRepository(Product);
const colorRepository = AppDataSource.getRepository(Color);
const sizeRepository = AppDataSource.getRepository(Size);
const variantImageRepo = AppDataSource.getRepository(VariantImage)

export const createVariant = async (
  body: any,
  userId: number
) => {

  // CHECK PRODUCT
  const existingProduct = await productRepository.findOne({
    where: {
      productId: body.productId,
    },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  let existingColor = null;
  let existingSize = null;

  // OPTIONAL COLOR
  if (body.colorId) {

    existingColor = await colorRepository.findOne({
      where: {
        colorId: body.colorId,
      },
    });

    if (!existingColor) {
      throw new Error("Color not found");
    }
  }

  // OPTIONAL SIZE
  if (body.sizeId) {

    existingSize = await sizeRepository.findOne({
      where: {
        sizeId: body.sizeId,
      },
    });

    if (!existingSize) {
      throw new Error("Size not found");
    }
  }

  // AUTO GENERATE NAME
  const variantName = [
    existingProduct.productName,
    existingColor?.name,
    existingSize?.name,
  ]
    .filter(Boolean)
    .join(" ");

  // AUTO GENERATE SKU
  const sku = [
    `PRD-${existingProduct.productId}`,
    existingColor?.name?.substring(0, 3),
    existingSize?.name,
  ]
    .filter(Boolean)
    .join("-")
    .toUpperCase();

  // CHECK DUPLICATE SKU
  const existingSku = await variantRepository.findOne({
    where: {
      sku,
    },
  });

  if (existingSku) {
    throw new Error("Variant already exists");
  }

  // CREATE VARIANT
  const variant = variantRepository.create({
    product: existingProduct,

    color: existingColor || null,

    size: existingSize || null,

    name: variantName,

    sku,

    price: body.price,

    stock: body.stock,

    discount_percentage:
      body.discount_percentage,

    discounted_price:
      body.discounted_price,

    created_by: userId,
  });

  const savedVariant =
    await variantRepository.save(
      variant
    );

  // CREATE VARIANT IMAGES
  if (
    body.images &&
    Array.isArray(body.images) &&
    body.images.length > 0
  ) {

    const imageEntities =
      body.images.map((img: any) =>
        variantImageRepo.create({

          image_url:
            img.image_url,

          alt_text:
            img.alt_text || null,

          is_active:
            img.is_active ?? true,

          created_by:
            userId,

          variant:
            savedVariant,
        })
      );

    await variantImageRepo.save(
      imageEntities
    );
  }

  // RETURN VARIANT WITH IMAGES
  return await variantRepository.findOne({
    where: {
      variantId:
        savedVariant.variantId,
    },
    relations: [
      "product",
      "color",
      "size",
      "variantImages",
    ],
  });
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
    discount_percentage: body.discount_percentage ?? existingVariant.discount_percentage,
    discounted_price: body.discounted_price ?? existingVariant.discounted_price,
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