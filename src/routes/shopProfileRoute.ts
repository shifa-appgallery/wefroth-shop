import { Router } from "express";
import { Request, Response } from "express";

import * as shopProfileController from "../controllers/shopProfileController"
import { optionalVerifyToken, verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-shopProfile", verifyToken, (req: Request, res: Response) => {
    shopProfileController.createShopProfileController(req, res);
});
router.get("/get-shopProfile", optionalVerifyToken, (req: Request, res: Response) => {
    shopProfileController.getShopProfilesController(req, res);
});
router.put("/update-shopProfile", verifyToken, (req: Request, res: Response) => {
    shopProfileController.updateShopProfileController(req, res);
});
router.delete("/delete-shopProfile", verifyToken, (req: Request, res: Response) => {
    shopProfileController.deleteShopProfileController(req, res);
});

router.get("/get-shop-profile-details", verifyToken, (req: Request, res: Response) => {
    shopProfileController.getShopProfileDetailsController(req, res);
});

router.get("/get-shop-dashboard-details", verifyToken, (req: Request, res: Response) => {
    shopProfileController.getShopDashboardConsroller(req, res);
});

export default router;