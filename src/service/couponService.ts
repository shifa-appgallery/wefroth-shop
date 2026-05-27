import { AppDataSource } from "../config/data-source";
import { Coupon } from "../entities/Coupon";

const couponRepository = AppDataSource.getRepository(Coupon);

export const createCoupon = async (
    body: any, userId: Number
) => {
    const coupon = couponRepository.create({
        code: body.code,
        coupon_type: body.coupon_type,
        discount_percentage: body.discount_percentage,
        minimum_order_amount: body.minimum_order_amount,
        description: body.description,
        expiry_date: body.expiry_date,
        usage_limit: body.usage_limit,
        created_by: userId,
    });

    return await couponRepository.save(coupon);
}

export const getCoupons = async () => {
    return await couponRepository.find({
        where: {
            is_active: true,
        },
        order: {
            created_at: "DESC",
        },
    });
};

export const updateCoupon = async (
    couponId: number,
    body: any,
    userId: number
) => {
    await couponRepository.update(couponId, {
        code: body.code,
        coupon_type: body.coupon_type,
        discount_percentage: body.discount_percentage,
        minimum_order_amount: body.minimum_order_amount,
        description: body.description,
        expiry_date: body.expiry_date,
        usage_limit: body.usage_limit,
        updated_by: userId,
    });

    return await couponRepository.findOne({
        where: {
            couponId,
        },
    });
};

export const deleteCoupon = async (couponId: string) => {
    await couponRepository.update(couponId, {
        is_active: false,
    });

    return true;
};