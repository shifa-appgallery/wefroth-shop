import { Router } from "express";
import express, { Request, Response } from "express";

import * as bannerController from "../controllers/bannerController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-banner", verifyToken, (req: Request, res: Response) => {
    bannerController.createBannerController(req, res);
});
router.get("/get-banner", (req: Request, res: Response) => {
    bannerController.getBannersController(req, res);
});


export default router;