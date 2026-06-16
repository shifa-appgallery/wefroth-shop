import { AppDataSource } from "../config/data-source";
import { OrderItem } from "../entities/OrderItem";
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
const orderItemRepository = AppDataSource.getRepository(OrderItem);


export const createShopProfile = async (
  body: any,
  userId: number
) => {

  if (!body.profileId) {
    throw new Error("Profile ID is required");
  }


  const existingShop = await shopProfileRepository.findOne({
    where: {
      profileId: body.profileId,
    },
  });

  if (existingShop) {
    throw new Error("Shop profile already exists");
  }

  const shopProfile = shopProfileRepository.create({
    seller_type: body.seller_type,

    // user id from token
    seller_id: userId,
    profileId: body.profileId,

    display_name: body.display_name,
    banner_url: body.banner_url,
    logo_url: body.logo_url,
    theme_color: body.theme_color,

    created_by: userId,
  });

  return await shopProfileRepository.save(shopProfile);
};

export const getShopProfiles = async (profileId?: number,
  offset: number = 0,
  limit: number = 10
) => {

  const whereCondition: any = {
    is_active: true,
  };

  if (profileId) {
    whereCondition.profileId = profileId;
  }

  const [data, total] = await shopProfileRepository.findAndCount({
    where: whereCondition,
    order: {
      created_at: "DESC",
    },
    skip: offset,
    take: limit,
  });

  return {
    total,
    offset,
    limit,
    data,
  };
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
      profileId: body.profileId,

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
  profileId: number
) => {
  // Shop Profile
  const shop = await shopRepo.findOne({
    where: {
      profileId,
      is_active: true,
    },
  });

  if (!shop) {
    throw new Error("Shop profile not found");
  }

  // Total Products
  const totalProducts = await productRepo.count({
    where: {
      shopProfile: {
        profileId: shop.profileId,
      },
      is_active: true,
    },
  });

  // Total Reviews
  const totalReviews = await reviewRepo.count({
    where: {
      product: {
        shopProfile: {
          profileId: shop.profileId,
        },
      },
    },
  });

  // Average Rating
  const ratingData = await reviewRepo
    .createQueryBuilder("review")
    .leftJoin("review.product", "product")
    .select("AVG(review.rating)", "avg")
    .where("product.shopProfileId = :shopProfileId", {
      shopProfileId: shop.profileId,
    })
    .getRawOne();

  // Low Stock Products
  const lowStockProducts = await variantRepo
    .createQueryBuilder("variant")
    .leftJoinAndSelect("variant.product", "product")
    .where("variant.stock <= :stock", { stock: 5 })
    .andWhere("product.shopProfile = :shopProfile", {
      shopProfile: shop.profileId,
    })
    .orderBy("variant.stock", "ASC")
    .take(5)
    .getMany();

  // Latest Reviews
  const latestReviews = await reviewRepo.find({
    where: {
      product: {
        shopProfile: {
          profileId: shop.profileId,
        },
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

export const getShopDashboard = async (
  shopProfileId: number
) => {

  const shop = await shopProfileRepository.findOne({
    where: {
      shopProfileId,
      is_active: true,
    },
  });

  if (!shop) {
    throw new Error("Shop profile not found");
  }

  const now = new Date();

  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(
    now.getDate() - now.getDay()
  );
  startOfThisWeek.setHours(0, 0, 0, 0);


  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(
    startOfLastWeek.getDate() - 7
  );


  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(
    endOfLastWeek.getMilliseconds() - 1
  );


  const getSalesOverview = (
    startDate: Date,
    endDate?: Date
  ) => {

    const query =
      orderItemRepository
        .createQueryBuilder("oi")

        .leftJoin(
          "oi.product",
          "product"
        )

        .leftJoin(
          "oi.order",
          "order"
        )

        .select(
          "COUNT(DISTINCT order.orderId)",
          "orders"
        )

        .addSelect(
          "COALESCE(SUM(oi.quantity),0)",
          "sales"
        )

        .addSelect(
          "COALESCE(SUM(oi.total_price),0)",
          "revenue"
        )

        .where(
          "product.shopProfileId = :shopProfileId",
          { shopProfileId }
        )

        .andWhere(
          "order.created_at >= :startDate",
          { startDate }
        );


    if (endDate) {
      query.andWhere(
        "order.created_at <= :endDate",
        { endDate }
      );
    }

    return query.getRawOne();
  };


  const [
    totalProducts,
    totalVariants,
    salesStats,
    lowStockProducts,
    latestProducts,
    categoryStats,
    recentOrders,
    topSellingProducts,
    thisWeekSales,
    lastWeekSales,
  ] = await Promise.all([
    // Total Products
    productRepo.count({
      where: {
        shopProfile: {
          shopProfileId,
        },
        is_active: true,
      },
    }),

    // Total Variants
    variantRepo
      .createQueryBuilder("variant")
      .leftJoin("variant.product", "product")
      .where(
        "product.shopProfileId = :shopProfileId",
        { shopProfileId }
      )
      .getCount(),

    // Total Orders, Sales, Revenue
    orderItemRepository
      .createQueryBuilder("oi")
      .leftJoin("oi.product", "product")
      .select(
        "COUNT(DISTINCT oi.orderOrderId)",
        "totalOrders"
      )
      .addSelect(
        "COALESCE(SUM(oi.quantity),0)",
        "totalSales"
      )
      .addSelect(
        "COALESCE(SUM(oi.total_price),0)",
        "totalRevenue"
      )
      .where(
        "product.shopProfileId = :shopProfileId",
        { shopProfileId }
      )
      .getRawOne(),

    // Low Stock Products
    variantRepo
      .createQueryBuilder("variant")
      .leftJoinAndSelect(
        "variant.product",
        "product"
      )
      .where(
        "product.shopProfileId = :shopProfileId",
        { shopProfileId }
      )
      .andWhere(
        "variant.stock <= :stock",
        { stock: 5 }
      )
      .orderBy(
        "variant.stock",
        "ASC"
      )
      .take(5)
      .getMany(),

    // Latest Products
    productRepo.find({
      where: {
        shopProfile: {
          shopProfileId,
        },
        is_active: true,
      },
      order: {
        created_at: "DESC",
      },
      take: 5,
    }),

    // Category Statistics
    productRepo
      .createQueryBuilder("product")
      .leftJoin(
        "product.category",
        "category"
      )
      .select(
        "category.categoryName",
        "category"
      )
      .addSelect(
        "COUNT(product.productId)",
        "totalProducts"
      )
      .where(
        "product.shopProfileId = :shopProfileId",
        { shopProfileId }
      )
      .groupBy(
        "category.categoryName"
      )
      .getRawMany(),

    // Recent Orders
    orderItemRepository
      .createQueryBuilder("oi")
      .leftJoinAndSelect(
        "oi.order",
        "order"
      )
      .leftJoinAndSelect(
        "oi.product",
        "product"
      )
      .where(
        "product.shopProfileId = :shopProfileId",
        { shopProfileId }
      )
      .orderBy(
        "order.created_at",
        "DESC"
      )
      .take(5)
      .getMany(),

    // Top Selling Products
    orderItemRepository
      .createQueryBuilder("oi")
      .leftJoin(
        "oi.product",
        "product"
      )
      .select(
        "product.productId",
        "productId"
      )
      .addSelect(
        "product.productName",
        "productName"
      )
      .addSelect(
        "COALESCE(SUM(oi.quantity),0)",
        "totalSold"
      )
      .addSelect(
        "COALESCE(SUM(oi.total_price),0)",
        "revenue"
      )
      .where(
        "product.shopProfileId = :shopProfileId",
        { shopProfileId }
      )
      .groupBy(
        "product.productId"
      )
      .addGroupBy(
        "product.productName"
      )
      .orderBy(
        "SUM(oi.quantity)",
        "DESC"
      )
      .limit(5)
      .getRawMany(),

    // This Week Sales
    getSalesOverview(
      startOfThisWeek
    ),

    // Last Week Sales
    getSalesOverview(
      startOfLastWeek,
      endOfLastWeek
    ),

  ]);
  return {
    success: true,
    message: "Shop dashboard details fetched successfully",

    data: {

      // Shop Profile Details
      shopProfile: {
        shopProfileId: shop.shopProfileId,
        displayName: shop.display_name,
        logo: shop.logo_url,
        banner: shop.banner_url,
        themeColor: shop.theme_color,
        sellerType: shop.seller_type,
      },

      // Overall Statistics
      statistics: {
        totalProducts,

        totalVariants,

        totalOrders: Number(
          salesStats?.totalOrders || 0
        ),

        totalSales: Number(
          salesStats?.totalSales || 0
        ),

        totalRevenue: Number(
          salesStats?.totalRevenue || 0
        ),
      },

      // Sales Comparison
      salesOverview: {

        thisWeek: {
          orders: Number(
            thisWeekSales?.orders || 0
          ),

          sales: Number(
            thisWeekSales?.sales || 0
          ),

          revenue: Number(
            thisWeekSales?.revenue || 0
          ),
        },


        lastWeek: {
          orders: Number(
            lastWeekSales?.orders || 0
          ),

          sales: Number(
            lastWeekSales?.sales || 0
          ),

          revenue: Number(
            lastWeekSales?.revenue || 0
          ),
        },
      },

      // Top Selling Products
      topSellingProducts: topSellingProducts.map(
        (item: any) => ({
          productId: Number(item.productId),

          productName: item.productName,

          totalSold: Number(
            item.totalSold || 0
          ),

          revenue: Number(
            item.revenue || 0
          ),
        })
      ),

      // Recent Orders
      recentOrders: recentOrders.map(
        (item: any) => ({
          orderId: item.order.orderId,

          orderNumber:
            item.order.order_number,

          orderStatus:
            item.order.order_status,

          productId:
            item.product.productId,

          productName:
            item.product.productName,

          quantity:
            item.quantity,

          amount:
            Number(item.total_price),

          orderedAt:
            item.order.created_at,
        })
      ),

      // Low Stock Products
      lowStockProducts: lowStockProducts.map(
        (item: any) => ({
          variantId: item.variantId,

          productId:
            item.product.productId,

          productName:
            item.product.productName,

          stock:
            item.stock,
        })
      ),

      // Category Wise Product Count
      categoryStatistics: categoryStats.map(
        (item: any) => ({
          category:
            item.category,

          totalProducts:
            Number(
              item.totalProducts
            ),
        })
      ),
    },
  };
}