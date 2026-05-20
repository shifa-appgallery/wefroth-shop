import { Router } from "express";
import express, { Request, Response } from "express";

import * as productReviewController from "../controllers/productReviewController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-review", verifyToken, (req: Request, res: Response) => {
    productReviewController.createProductReview(req, res);
});
router.get("/get-review", verifyToken, (req: Request, res: Response) => {
    productReviewController.getAllProductReviews(req, res);
});
router.put("/update-review", verifyToken, (req: Request, res: Response) => {
    productReviewController.updateProductReview(req, res);
});
router.delete("/delete-review", verifyToken, (req: Request, res: Response) => {
    productReviewController.deleteProductReview(req, res);
});
router.get("/get-review-by-id", verifyToken, (req: Request, res: Response) => {
    productReviewController.getProductReviewById(req, res);
});

export default router;