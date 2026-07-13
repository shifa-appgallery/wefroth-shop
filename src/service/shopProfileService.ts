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

    // Shop Address
    address: body.address,
    city: body.city,
    state: body.state,
    country: body.country,
    postal_code: body.postal_code,
    landmark: body.landmark,
    latitude: body.latitude,
    longitude: body.longitude,

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

  const shopProfile = await shopProfileRepository.findOne({
    where: { shopProfileId },
  });

  if (!shopProfile) {
    throw new Error("Shop profile not found");
  }

  await shopProfileRepository.update(
    shopProfileId,
    {
      display_name: body.display_name,
      banner_url: body.banner_url,
      logo_url: body.logo_url,
      theme_color: body.theme_color,
      profileId: body.profileId,

      // Shop Address
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      postal_code: body.postal_code,
      landmark: body.landmark,
      latitude: body.latitude,
      longitude: body.longitude,

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
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  const startOfPreviousWeek = new Date(startOfLastWeek);
  startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

  const endOfPreviousWeek = new Date(startOfLastWeek);
  endOfPreviousWeek.setMilliseconds(-1);


  const [
    totalProducts,
    totalVariants,
    salesStats,

    lastWeekProducts,
    previousWeekProducts,

    lastWeekVariants,
    previousWeekVariants,

    lastWeekStats,
    previousWeekStats,

    lowStockProducts,
    latestProducts,
    categoryStats,
    recentOrders,
    topSellingProducts,
    thisWeekSales,
    lastWeekSales,
  ] = await Promise.all([
    getTotalProducts(shopProfileId),
    getTotalVariants(shopProfileId),
    getSalesStats(shopProfileId),

    getTotalProducts(
      shopProfileId,
      startOfLastWeek,
      endOfLastWeek
    ),

    getTotalProducts(
      shopProfileId,
      startOfPreviousWeek,
      endOfPreviousWeek
    ),

    getTotalVariants(
      shopProfileId,
      startOfLastWeek,
      endOfLastWeek
    ),
    getTotalVariants(
      shopProfileId,
      startOfPreviousWeek,
      endOfPreviousWeek
    ),
    getSalesStats(
      shopProfileId,
      startOfLastWeek,
      endOfLastWeek
    ),
    getSalesStats(
      shopProfileId,
      startOfPreviousWeek,
      endOfPreviousWeek
    ),
    getLowStockProducts(shopProfileId),
    getLatestProducts(shopProfileId),
    getCategoryStatistics(shopProfileId),
    getRecentOrders(shopProfileId),
    getTopSellingProducts(shopProfileId),
    getSalesOverview(shopProfileId, startOfThisWeek),
    getSalesOverview(
      shopProfileId,
      startOfLastWeek,
      endOfLastWeek
    ),
  ]);
  return {
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
      products: {
        total: totalProducts,
        lastWeek: lastWeekProducts,
        previousWeek: previousWeekProducts,
        change: calculateChange(
          lastWeekProducts,
          previousWeekProducts
        ),
      },

      variants: {
        total: totalVariants,
        lastWeek: lastWeekVariants,
        previousWeek: previousWeekVariants,
        change: calculateChange(
          lastWeekVariants,
          previousWeekVariants
        ),
      },

      orders: {
        total: Number(salesStats.totalOrders),
        lastWeek: Number(lastWeekStats.totalOrders),
        previousWeek: Number(previousWeekStats.totalOrders),
        change: calculateChange(
          Number(lastWeekStats.totalOrders),
          Number(previousWeekStats.totalOrders)
        ),
      },

      sales: {
        total: Number(salesStats.totalSales),
        lastWeek: Number(lastWeekStats.totalSales),
        previousWeek: Number(previousWeekStats.totalSales),
        change: calculateChange(
          Number(lastWeekStats.totalSales),
          Number(previousWeekStats.totalSales)
        ),
      },

      revenue: {
        total: Number(salesStats.totalRevenue),
        lastWeek: Number(lastWeekStats.totalRevenue),
        previousWeek: Number(previousWeekStats.totalRevenue),
        change: calculateChange(
          Number(lastWeekStats.totalRevenue),
          Number(previousWeekStats.totalRevenue)
        ),
      },
    },

    // Sales Comparison
    salesOverview: {
      thisWeek: formatSalesOverview(thisWeekSales),
      lastWeek: formatSalesOverview(lastWeekSales),
    },

    // Top Selling Products
    topSellingProducts: topSellingProducts.map((item: any) => ({
      productId: Number(item.productId),
      productName: item.productName,

      variantId: Number(item.variantId),
      variantName: item.variantName,
      sku: item.sku,

      color: item.color,
      size: item.size,

      images:
        typeof item.images === "string"
          ? JSON.parse(item.images)
          : item.images ?? [],

      price: Number(item.price),
      totalSold: Number(item.totalSold),
      revenue: Number(item.revenue),
    })),

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
  };
}

const formatSalesOverview = (data: any[]) => {
  return data.reduce((acc: any, item: any) => {
    acc[item.day] = {
      orders: Number(item.orders),
      sales: Number(item.sales),
      revenue: Number(item.revenue),
    };
    return acc;
  }, {});
};

const getTotalProducts = async (
  shopProfileId: number,
  startDate?: Date,
  endDate?: Date
) => {
  const query = productRepo
    .createQueryBuilder("product")
    .where(
      "product.shopProfileId = :shopProfileId",
      { shopProfileId }
    )
    .andWhere("product.is_active = true");

  if (startDate && endDate) {
    query.andWhere(
      "product.created_at BETWEEN :startDate AND :endDate",
      { startDate, endDate }
    );
  }

  return query.getCount();
};

const getTotalVariants = async (
  shopProfileId: number,
  startDate?: Date,
  endDate?: Date
) => {
  const query = variantRepo
    .createQueryBuilder("variant")
    .leftJoin("variant.product", "product")
    .where(
      "product.shopProfileId = :shopProfileId",
      { shopProfileId }
    );

  if (startDate && endDate) {
    query.andWhere(
      "variant.created_at BETWEEN :startDate AND :endDate",
      { startDate, endDate }
    );
  }

  return query.getCount();
};

const getSalesStats = async (
  shopProfileId: number,
  startDate?: Date,
  endDate?: Date
) => {
  const query = orderItemRepository
    .createQueryBuilder("oi")
    .leftJoin("oi.product", "product")
    .leftJoin("oi.order", "order")
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
    );

  if (startDate && endDate) {
    query.andWhere(
      "order.created_at BETWEEN :startDate AND :endDate",
      { startDate, endDate }
    );
  }

  return query.getRawOne();
};
const getLowStockProducts = (
  shopProfileId: number
) => {
  return variantRepo
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
    .getMany();
};

const getLatestProducts = (
  shopProfileId: number
) => {
  return productRepo.find({
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
  });
};

const getCategoryStatistics = (
  shopProfileId: number
) => {
  return productRepo
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
    .getRawMany();
};

const getRecentOrders = (
  shopProfileId: number
) => {
  return orderItemRepository
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
    .getMany();
};

const getTopSellingProducts = (
  shopProfileId: number
) => {
  return orderItemRepository
    .createQueryBuilder("oi")
    .leftJoin("oi.variant", "variant")
    .leftJoin("variant.product", "product")
    .leftJoin("variant.color", "color")
    .leftJoin("variant.size", "size")
    .leftJoin(
      "variant.variantImages",
      "image",
      "image.is_active = true"
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
      "variant.variantId",
      "variantId"
    )
    .addSelect(
      "variant.name",
      "variantName"
    )
    .addSelect(
      "variant.sku",
      "sku"
    )
    .addSelect(
      "variant.price",
      "price"
    )

    .addSelect(
      "color.name",
      "color"
    )
    .addSelect(
      "size.name",
      "size"
    )

    .addSelect(
      `COALESCE(
        JSON_AGG(DISTINCT image.image_url)
        FILTER (WHERE image.image_url IS NOT NULL),
        '[]'
      )`,
      "images"
    )

    .addSelect(
      "SUM(oi.quantity)",
      "totalSold"
    )

    .addSelect(
      "SUM(oi.total_price)",
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

    .groupBy(
      "variant.variantId"
    )
    .addGroupBy(
      "variant.name"
    )
    .addGroupBy(
      "variant.sku"
    )
    .addGroupBy(
      "variant.price"
    )

    .addGroupBy(
      "color.name"
    )
    .addGroupBy(
      "size.name"
    )

    .orderBy(
      "SUM(oi.quantity)",
      "DESC"
    )

    .limit(5)

    .getRawMany();
};
const getSalesOverview = (
  shopProfileId: number,
  startDate: Date,
  endDate?: Date
) => {
  const query = orderItemRepository
    .createQueryBuilder("oi")
    .leftJoin("oi.product", "product")
    .leftJoin("oi.order", "order")
    .select(
      `TRIM(TO_CHAR("order"."created_at", 'Day'))`,
      "day"
    )
    .addSelect(
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
    )
    .groupBy(`DATE("order"."created_at")`)
    .addGroupBy(
      `TO_CHAR("order"."created_at", 'Day')`
    );

  if (endDate) {
    query.andWhere(
      "order.created_at <= :endDate",
      { endDate }
    );
  }

  return query.getRawMany();
};
const calculateChange = (
  current: number,
  previous: number
) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number(
    (((current - previous) / previous) * 100).toFixed(2)
  );
};