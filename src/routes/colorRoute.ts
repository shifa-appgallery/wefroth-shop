import { Router } from "express";
import { Request, Response } from "express";

import * as colorController from "../controllers/colorController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-color", verifyToken, (req: Request, res: Response) => {
    colorController.createColor(req, res);
});
router.get("/get-color", verifyToken, (req: Request, res: Response) => {
    colorController.getAllColors(req, res);
});
router.get("/get-color-by-id", verifyToken, (req: Request, res: Response) => {
    colorController.getColorById(req, res);
});
router.put("/update-color", verifyToken, (req: Request, res: Response) => {
    colorController.updateColor(req, res);
});
router.delete("/delete-color", verifyToken, (req: Request, res: Response) => {
    colorController.deleteColor(req, res);
});

export default router;