import { Router } from "express";
import { Request, Response } from "express";

import * as couponController from "../controllers/couponController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-coupon", verifyToken, (req: Request, res: Response) => {
    couponController.createCouponController(req, res);
});
router.get("/get-coupons", verifyToken, (req: Request, res: Response) => {
    couponController.getCouponsController(req, res);
});
router.put("/update-coupon", verifyToken, (req: Request, res: Response) => {
    couponController.updateCouponController(req, res);
});
router.delete("/delete-coupon", verifyToken, (req: Request, res: Response) => {
    couponController.deleteCouponController(req, res);
});

export default router;