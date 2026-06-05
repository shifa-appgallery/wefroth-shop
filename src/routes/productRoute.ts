import { Router } from "express";
import express, { Request, Response } from "express";

import * as productController from "../controllers/productController"
import { optionalVerifyToken, verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-product", verifyToken, (req: Request, res: Response) => {
    productController.createProductController(req, res);
});
router.get("/get-product", (req: Request, res: Response) => {
    productController.getProductsController(req, res);
});
router.put("/update-product", verifyToken, (req: Request, res: Response) => {
    productController.updateProductController(req, res);
});
router.delete("/delete-product", verifyToken, (req: Request, res: Response) => {
    productController.deleteProductController(req, res);
});
router.get("/get-vendor-products", verifyToken, (req: Request, res: Response) => {
    productController.getProductsDetailsController(req, res);
});
router.get("/get-new-arrivals", optionalVerifyToken,(req: Request, res: Response) => {
    productController.getNewArrivalProductsController(req, res);
});

export default router;