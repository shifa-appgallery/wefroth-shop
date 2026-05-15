import { Router } from "express";
import express, { Request, Response } from "express";

import * as categoryController from "../controllers/categoryController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-category", verifyToken, (req: Request, res: Response) => {
    categoryController.createCategoryController(req, res);
});
router.get("/get-category", verifyToken, (req: Request, res: Response) => {
    categoryController.getCategoriesController(req, res);
});
router.put("/update-category", verifyToken, (req: Request, res: Response) => {
    categoryController.updateCategoryController(req, res);
});
router.put("/update-category-status", verifyToken, (req: Request, res: Response) => {
    categoryController.updateCategoryStatusController(req, res);
});

export default router;