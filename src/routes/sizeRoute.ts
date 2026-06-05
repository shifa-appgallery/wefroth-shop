import { Router } from "express";
import { Request, Response } from "express";

import * as sizeController from "../controllers/sizeController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-size", verifyToken, (req: Request, res: Response) => {
    sizeController.createSize(req, res);
});
router.get("/get-size", (req: Request, res: Response) => {
    sizeController.getAllSizes(req, res);
});
router.get("/get-size-by-id", (req: Request, res: Response) => {
    sizeController.getSizeById(req, res);
});
router.put("/update-size", verifyToken, (req: Request, res: Response) => {
    sizeController.updateSize(req, res);
});
router.delete("/delete-size", verifyToken, (req: Request, res: Response) => {
    sizeController.deleteSize(req, res);
});

export default router;