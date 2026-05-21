import { AppDataSource } from "../config/data-source";
import { ShippingAddress } from "../entities/ShippingAddress";

const shippingAddresRepository = AppDataSource.getRepository(ShippingAddress);

export const createShippingAddress = async (body: any, userId) => {
    if (body.is_default) {
        await shippingAddresRepository.update(
            { user_id: userId },
            { is_default: false }
        );
    }
    const address = shippingAddresRepository.create({
        ...body,
        user_id: userId,
        created_by: userId,
    });
    return await shippingAddresRepository.save(address)
}

export const getMyAddressess = async (userId: number) => {
    return await shippingAddresRepository.find({
        where: {
            user_id: userId,
            is_active: true
        },
        order: {
            created_at: "DESC"
        },
    });
};

export const getAddressById = async (shippingAddressId: number, userId: number) => {
    return await shippingAddresRepository.findOne({
        where: {
            shippingAddressId: shippingAddressId,
            user_id: userId
        },
    });
};
export const updateAddress = async (
  id: number,
  body: any,
  userId: number
) => {
  const address = await shippingAddresRepository.findOne({
    where: { shippingAddressId: id, user_id: userId },
  });

  if (!address) throw new Error("Address not found");

  Object.assign(address, body);
  address.updated_by = userId;

  return await shippingAddresRepository.save(address);
};

export const deleteAddress = async (id: number, userId: number) => {
  return await shippingAddresRepository.update(
    { shippingAddressId: id, user_id: userId },
    { is_active: false }
  );
};

export const setDefaultAddress = async (id: number, userId: number) => {
  // unset all
  await shippingAddresRepository.update(
    { user_id: userId },
    { is_default: false }
  );

  // set selected
  const result = await shippingAddresRepository.update(
    { shippingAddressId: id, user_id: userId },
    { is_default: true }
  );

  if (!result.affected) {
    throw new Error("Address not found");
  }

  return { message: "Default address updated" };
};