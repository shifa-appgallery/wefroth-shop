import { Router } from "express";
import express, { Request, Response } from "express";

import * as productController from "../controllers/productController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-product", verifyToken, (req: Request, res: Response) => {
    productController.createProductController(req, res);
});
router.get("/get-product", verifyToken, (req: Request, res: Response) => {
    productController.getProductsController(req, res);
});
router.put("/update-product", verifyToken, (req: Request, res: Response) => {
    productController.updateProductController(req, res);
});
router.delete("/delete-product", verifyToken, (req: Request, res: Response) => {
    productController.deleteProductController(req, res);
});
router.get("/get-product-details", verifyToken, (req: Request, res: Response) => {
    productController.getProductsDetailsController(req, res);
});

export default router;