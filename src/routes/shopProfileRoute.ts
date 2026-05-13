import { Router } from "express";
import { Request, Response } from "express";

import * as shopProfileController from "../controllers/shopProfileController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-shopProfile", verifyToken, (req: Request, res: Response) => {
    shopProfileController.createShopProfileController(req, res);
});
router.get("/get-shopProfile", verifyToken, (req: Request, res: Response) => {
    shopProfileController.getShopProfilesController(req, res);
});
router.put("/update-shopProfile", verifyToken, (req: Request, res: Response) => {
    shopProfileController.updateShopProfileController(req, res);
});
router.delete("/delete-shopProfile", verifyToken, (req: Request, res: Response) => {
    shopProfileController.deleteShopProfileController(req, res);
});

export default router;