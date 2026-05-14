import { Router } from "express";
import express, { Request, Response } from "express";

import * as cartController from "../controllers/cartController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/add-to-cart", verifyToken, (req: Request, res: Response) => {
    cartController.addToCartController(req, res);
});
router.get("/get-cart", verifyToken, (req: Request, res: Response) => {
    cartController.getCartController(req, res);
});
router.put("/update-cartItem", verifyToken, (req: Request, res: Response) => {
    cartController.updateCartItemController(req, res);
});
router.delete("/remove-cartItem", verifyToken, (req: Request, res: Response) => {
    cartController.removeCartItemController(req, res);
});
router.delete("/clear-cart", verifyToken, (req: Request, res: Response) => {
    cartController.clearCartController(req, res);
});

export default router;