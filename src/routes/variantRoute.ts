import { Router } from "express";
import express, { Request, Response } from "express";

import * as variantController from "../controllers/variantController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-variant", verifyToken, (req: Request, res: Response) => {
    variantController.createVariantController(req, res);
});
router.get("/get-variant", verifyToken, (req: Request, res: Response) => {
    variantController.getVariantsController(req, res);
});
router.put("/update-variant", verifyToken, (req: Request, res: Response) => {
    variantController.updateVariantController(req, res);
});
router.delete("/delet-variant", verifyToken, (req: Request, res: Response) => {
    variantController.deleteVariantController(req, res);
});

export default router;