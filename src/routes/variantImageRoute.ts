import { Router } from "express";
import express, { Request, Response } from "express";

import * as variantImageController from "../controllers/variantImageController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-image", verifyToken, (req: Request, res: Response) => {
    variantImageController.createImage(req, res);
});
router.get("/get-image-by-id", verifyToken, (req: Request, res: Response) => {
    variantImageController.getImagesById(req, res);
});
router.put("/update-image", verifyToken, (req: Request, res: Response) => {
    variantImageController.updateImage(req, res);
});
router.delete("/delete-image", verifyToken, (req: Request, res: Response) => {
    variantImageController.deleteImage(req, res);
});

export default router;