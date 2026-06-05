import { AppDataSource } from "../config/data-source";
import { Product } from "../entities/Product";
import { ProductReview } from "../entities/ProductReview";
import { ProductVariant } from "../entities/ProductVariant";
import { ShopProfile } from "../entities/ShopProfile";

const shopProfileRepository =
  AppDataSource.getRepository(ShopProfile);
const shopRepo = AppDataSource.getRepository(ShopProfile);
const productRepo = AppDataSource.getRepository(Product);
const reviewRepo = AppDataSource.getRepository(ProductReview);
const variantRepo = AppDataSource.getRepository(ProductVariant);


export const createShopProfile = async (
  body: any,
  userId: number
) => {

  const existingShop = await shopProfileRepository.findOne({
    where: {
      teamId: body.teamId,
    },
  });

  if (existingShop) {
    throw new Error("Shop profile already exists");
  }

  const shopProfile = shopProfileRepository.create({
    seller_type: body.seller_type,

    // user id from token
    seller_id: userId,
    teamId: body.teamId,

    display_name: body.display_name,
    banner_url: body.banner_url,
    logo_url: body.logo_url,
    theme_color: body.theme_color,

    created_by: userId,
  });

  return await shopProfileRepository.save(shopProfile);
};

export const getShopProfiles = async (teamId?: number) => {

  const whereCondition: any = {
    is_active: true,
  };

  if (teamId) {
    whereCondition.teamId = teamId;
  }

  return await shopProfileRepository.find({
    where: whereCondition,
    order: {
      created_at: "DESC",
    },
  });
};

export const updateShopProfile = async (
  shopProfileId: number,
  body: any,
  userId: number
) => {

  await shopProfileRepository.update(
    shopProfileId,
    {
      display_name: body.display_name,
      banner_url: body.banner_url,
      logo_url: body.logo_url,
      theme_color: body.theme_color,
      teamId: body.teamId,

      updated_by: userId,
    }
  );

  return await shopProfileRepository.findOne({
    where: {
      shopProfileId,
    },
  });
};

export const deleteShopProfile = async (
  shopProfileId: string
) => {

  await shopProfileRepository.update(
    shopProfileId,
    {
      is_active: false,
    }
  );

  return true;
};

export const getShopProfileDetails = async (
  teamId: number
) => {
  // Shop Profile
  const shop = await shopRepo.findOne({
    where: {
      teamId,
      is_active: true,
    },
  });

  if (!shop) {
    throw new Error("Shop profile not found");
  }

  // Total Products
  const totalProducts = await productRepo.count({
    where: {
      teamId: shop.teamId,
      is_active: true,
    },
  });

  // Total Reviews
  const totalReviews = await reviewRepo.count({
    where: {
      product: {
        teamId: shop.teamId,
      },
    },
  });

  // Average Rating
  const ratingData = await reviewRepo
    .createQueryBuilder("review")
    .leftJoin("review.product", "product")
    .select("AVG(review.rating)", "avg")
    .where("product.teamId = :teamId", {
      teamId: shop.teamId,
    })
    .getRawOne();

  // Low Stock Products
  const lowStockProducts = await variantRepo
    .createQueryBuilder("variant")
    .leftJoinAndSelect("variant.product", "product")
    .where("variant.stock <= :stock", { stock: 5 })
    .andWhere("product.teamId = :teamId", {
      teamId: shop.teamId,
    })
    .orderBy("variant.stock", "ASC")
    .take(5)
    .getMany();

  // Latest Reviews
  const latestReviews = await reviewRepo.find({
    where: {
      product: {
        teamId: shop.teamId,
      },
    },
    relations: ["product"],
    order: {
      created_at: "DESC",
    },
    take: 5,
  });

  return {
    shopProfile: shop,

    stats: {
      products: totalProducts,
      reviews: totalReviews,
      rating: Number(ratingData?.avg || 0).toFixed(1),
    },

    lowStockProducts,

    latestReviews,
  };
};