import { Router } from "express";
import express, { Request, Response } from "express";

import * as genderController from "../controllers/genderController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-gender", verifyToken, (req: Request, res: Response) => {
    genderController.createGender(req, res);
});
router.get("/get-gender", verifyToken, (req: Request, res: Response) => {
    genderController.getAllGenders(req, res);
});
router.put("/update-gender", verifyToken, (req: Request, res: Response) => {
    genderController.updateGender(req, res);
});
router.delete("/delete-gender", verifyToken, (req: Request, res: Response) => {
    genderController.deleteGender(req, res);
});

export default router;