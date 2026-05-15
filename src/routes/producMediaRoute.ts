import { Router } from "express";
import express, { Request, Response } from "express";

import * as mediaController from "../controllers/productMediaController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-media", verifyToken, (req: Request, res: Response) => {
    mediaController.createProductMedia(req, res);
});
router.get("/get-media", verifyToken, (req: Request, res: Response) => {
    mediaController.getAllProductMedia(req, res);
});
router.get("/get-media-by-id", verifyToken, (req: Request, res: Response) => {
    mediaController.getProductMediaById(req, res);
});
router.put("/update-media", verifyToken, (req: Request, res: Response) => {
    mediaController.updateProductMedia(req, res);
});
router.delete("/delete-media", verifyToken, (req: Request, res: Response) => {
    mediaController.deleteProductMedia(req, res);
});

export default router;