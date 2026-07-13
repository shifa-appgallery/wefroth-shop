import { Router } from "express";
import express, { Request, Response } from "express";

import * as returnRequestController from "../controllers/returnRequestController"
import { optionalVerifyToken, verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-return-request", verifyToken, (req: Request, res: Response) => {
    returnRequestController.createReturnRequestConrtoller(req, res);
});

router.get("/get-return-request", verifyToken, (req: Request, res: Response) => {
    returnRequestController.getSellerReturnRequests(req, res);
});

router.put("/approve-reject-return-request", verifyToken, (req: Request, res: Response) => {
    returnRequestController.approveRejectReturnRequest(req, res);
});

router.put("/ship-return-product", verifyToken, (req: Request, res: Response) => {
    returnRequestController.shipReturnProduct(req, res);
});

router.put("/receive-return-product", verifyToken, (req: Request, res: Response) => {
    returnRequestController.receiveReturnProduct(req, res);
});

router.put("/refund-product", verifyToken, (req: Request, res: Response) => {
    returnRequestController.refundReturnRequest(req, res);
});

export default router;