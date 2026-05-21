import { AuthRequest } from "../middleware/authorization";
import { createCoupon, deleteCoupon, getCoupons, updateCoupon } from "../service/couponService";
import { Response } from "express";

export const createCouponController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user.id;
        const response = await createCoupon(req.body, userId);
        return res.status(201).json({
            success: true,
            data: response,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getCouponsController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const response = await getCoupons();

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCouponController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user.id;

        const response = await updateCoupon(
            Number(req.query.couponId),
            req.body,
            userId
        );

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteCouponController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        await deleteCoupon(String(req.query.couponId));

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully",
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};