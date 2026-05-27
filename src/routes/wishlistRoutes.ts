import { Router } from "express";
import { Request, Response } from "express";

import * as wishlistController from "../controllers/wishlistController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-wishlist", verifyToken, (req: Request, res: Response) => {
    wishlistController.createWishList(req, res);
});
router.get("/get-wishlist", verifyToken, (req: Request, res: Response) => {
    wishlistController.getWishList(req, res);
});
router.delete("/remove-from-wishlist", verifyToken, (req: Request, res: Response) => {
    wishlistController.removeFromWishList(req, res);
});

export default router;