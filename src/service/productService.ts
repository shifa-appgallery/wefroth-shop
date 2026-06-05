import { In, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { Color } from "../entities/Color";
import { Gender } from "../entities/Gender";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Product";
import { ProductMedia } from "../entities/ProductMedia";
import { ProductVariant } from "../entities/ProductVariant";
import { ShopProfile } from "../entities/ShopProfile";
import { Size } from "../entities/Size";
import { VariantImage } from "../entities/VanriantImage";
import { Wishlist } from "../entities/Wishlist";

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const genderRepository = AppDataSource.getRepository(Gender);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const shopProfileRepository = AppDataSource.getRepository(ShopProfile)
const wishListRepo = AppDataSource.getRepository(Wishlist);

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
        teamId: body.teamId,
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

      teamId: body.teamId,

      category: existingCategory,

      gender: existingGender,

      base_price: body.base_price,

      discount_percentage:
        body.discount_percentage || 0,

      discounted_price:
        body.discounted_price ||
        body.base_price,

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

            discount_percentage:
              item.discount_percentage || 0,

            discounted_price:
              item.discounted_price ||
              item.price,

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
          teamId: savedProduct.teamId,
          base_price: savedProduct.base_price,
          discount_percentage:
            savedProduct.discount_percentage,

          discounted_price:
            savedProduct.discounted_price,
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

          discount_percentage:
            variant.discount_percentage,

          discounted_price:
            variant.discounted_price,


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

export const getProducts = async (
  offset: number,
  limit: number,
  categoryId?: number,
  gender?: string,
  categorySlug?: string,
  sizeId?: number,
  colorId?: number,
  discount?: number,
  searchTerm?: string,
  type?: string,
  userId?: number
) => {
  let categoryIds: number[] = [];

  if (categoryId) {
    const category = await categoryRepository.findOne({
      where: { categoryId },
      relations: ["children"],
    });

    categoryIds = [
      categoryId,
      ...(category?.children?.map((c) => c.categoryId) || []),
    ];
  } else if (categorySlug) {
    const category = await categoryRepository.findOne({
      where: { slug: categorySlug },
      relations: ["children"],
    });

    if (category) {
      categoryIds = [
        category.categoryId,
        ...(category.children?.map((c) => c.categoryId) || []),
      ];
    }
  }

  const query = productRepository
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.gender", "gender")
    .leftJoinAndSelect("product.variants", "variant")
    .leftJoinAndSelect("variant.color", "color")
    .leftJoinAndSelect("variant.size", "size")
    .leftJoinAndSelect("variant.variantImages", "variantImages")
    .leftJoinAndSelect("product.media", "media")
    .leftJoinAndSelect("product.reviews", "reviews")
    .where("product.is_active = :isActive", { isActive: true });

  if (categoryIds.length > 0) {
    query.andWhere("category.categoryId IN (:...categoryIds)", {
      categoryIds,
    });
  }

  if (gender && gender !== "ALL") {
    query.andWhere("gender.name = :gender", { gender });
  }

  if (colorId) {
    query.andWhere("color.colorId = :colorId", { colorId });
  }

  if (sizeId) {
    query.andWhere("size.sizeId = :sizeId", { sizeId });
  }

  if (discount !== undefined && discount !== null) {
    query.andWhere(
      "product.discount_percentage >= :discount",
      { discount }
    );
  }

  if (searchTerm?.trim()) {
    query.andWhere(
      "product.productName ILIKE :searchTerm",
      {
        searchTerm: `%${searchTerm.trim()}%`,
      }
    );
  }

  if (type === "newArrival") {
    const last10Days = new Date();;

    last10Days.setDate(
      last10Days.getDate() - 10
    );

    query.andWhere(
      "product.created_at >= :last10Days",
      { last10Days }
    );
  }
  if (type === "newArrival") {
    query.orderBy(
      "product.created_at",
      "DESC"
    );
  }
  query.skip(offset).take(limit);

  const [data, total] = await query.getManyAndCount();

  let wishlistProductIds = new Set<number>();

  if (userId) {
    const wishlistItems = await wishListRepo.find({
      where: {
        user_id: Number(userId),
        is_active: true,
      },
      relations: ["product"],
    });

    wishlistProductIds = new Set(
      wishlistItems.map(
        (item) => item.product.productId
      )
    );
  }

  const updatedProducts = data.map((product) => ({
    ...product,
    isAddedToWishlist:
      wishlistProductIds.has(product.productId),
  }));

  return {
    total,
    offset,
    limit,
    data: updatedProducts,
  };
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

    discount_percentage:
      body.discount_percentage ??
      existingProduct.discount_percentage,

    discounted_price:
      body.discounted_price ??
      existingProduct.discounted_price,

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

export const getProductDetails = async ({
  teamId,
  searchTerm,
  categoryId,
  offset = 0,
  limit = 10,
}: any) => {


  const baseQuery = productRepository
    .createQueryBuilder("product")

    .where(
      "product.is_active = :is_active",
      {
        is_active: true,
      }
    )

    .andWhere(
      "product.teamId = :teamId",
      {
        teamId,
      }
    );

  if (searchTerm) {

    baseQuery.andWhere(
      `
      LOWER(product.productName)
      LIKE LOWER(:searchTerm)
      `,
      {
        searchTerm: `%${searchTerm}%`,
      }
    );
  }

  if (categoryId) {

    if (categoryId) {
      baseQuery.andWhere(
        'product.categoryCategoryId = :categoryId',
        {
          categoryId,
        }
      );
    }
  }

  const total =
    await baseQuery.getCount();

  const productIdsResult =
    await baseQuery
      .clone()

      .select(
        "product.productId",
        "productId"
      )

      .orderBy(
        "product.created_at",
        "DESC"
      )

      .offset(offset)

      .limit(limit)

      .getRawMany();

  const productIds =
    productIdsResult.map(
      (item: any) =>
        item.productId
    );

  if (!productIds.length) {

    return {
      total,
      offset,
      limit,
      data: [],
    };
  }

  const products =
    await productRepository
      .createQueryBuilder("product")

      .leftJoinAndSelect(
        "product.category",
        "category"
      )

      .leftJoinAndSelect(
        "product.gender",
        "gender"
      )

      .leftJoinAndSelect(
        "product.variants",
        "variants"
      )

      .leftJoinAndSelect(
        "variants.variantImages",
        "variantImages"
      )

      .leftJoinAndSelect(
        "variants.color",
        "color"
      )

      .leftJoinAndSelect(
        "variants.size",
        "size"
      )

      .leftJoinAndSelect(
        "product.media",
        "media"
      )

      .leftJoinAndSelect(
        "product.reviews",
        "reviews"
      )

      .whereInIds(productIds)

      .orderBy(
        "product.created_at",
        "DESC"
      )

      .getMany();

  const shopProfile =
    await shopProfileRepository.findOne({
      where: {
        teamId,
        is_active: true,
      },
    });


  const updatedProducts =
    await Promise.all(

      products.map(
        async (product: any) => {

          // TOTAL STOCK
          const totalStock =
            product.variants.reduce(
              (
                sum: number,
                variant: any
              ) =>
                sum +
                Number(
                  variant.stock || 0
                ),

              0
            );

          const salesData =
            await orderItemRepository
              .createQueryBuilder("oi")

              .select(
                "SUM(oi.quantity)",
                "totalSold"
              )

              .addSelect(
                "SUM(oi.total_price)",
                "revenue"
              )

              .where(
                "oi.product = :productId",
                {
                  productId:
                    product.productId,
                }
              )

              .getRawOne();

          return {

            ...product,

            shopProfile,

            totalStock,

            totalSold: Number(
              salesData?.totalSold || 0
            ),

            revenue: Number(
              salesData?.revenue || 0
            ),
          };
        }
      )
    );

  return {
    total,
    offset,
    limit,
    data: updatedProducts,
  };
};

export const getNewArrivalProducts = async (
  userId: string | null,
  offset: number = 0,
  limit: number = 10
) => {
  const last3Days = new Date();

  last3Days.setDate(
    last3Days.getDate() - 3
  );

  const [products, total] =
    await productRepository.findAndCount({

      relations: [
        "category",
        "gender",
        "variants",
        "variants.variantImages",
        "variants.color",
        "variants.size",
        "media",
        "reviews",
      ],

      where: {
        is_active: true,

        created_at:
          MoreThanOrEqual(last3Days),
      },

      order: {
        created_at: "DESC",
      },

      skip: offset,

      take: limit,
    });

  let wishlistProductIds = new Set<number>();

  // Only check wishlist if user logged in
  if (userId) {

    const wishlistItems = await wishListRepo.find({
      where: {
        user_id: Number(userId),
        is_active: true,
      },
      relations: ["product"],
    });

    wishlistProductIds = new Set(
      wishlistItems.map(
        (item) => item.product.productId
      )
    );
  }

  // Add isAddedToWishlist
  const updatedProducts = products.map((product) => ({
    ...product,
    isAddedToWishlist:
      wishlistProductIds.has(product.productId),
  }));

  return {
    total,
    offset,
    limit,
    data: updatedProducts,
  };
};