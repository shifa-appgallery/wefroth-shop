import { AppDataSource } from "../config/data-source";
import { ShopProfile } from "../entities/ShopProfile";

const shopProfileRepository =
  AppDataSource.getRepository(ShopProfile);

export const createShopProfile = async (
  body: any,
  userId: number
) => {

  const existingShop = await shopProfileRepository.findOne({
    where: {
      seller_type: body.seller_type,
      seller_id: userId,
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

export const getShopProfiles = async () => {

  return await shopProfileRepository.find({
    where: {
      is_active: true,
    },
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