import { Router } from "express";
import { Request, Response } from "express";

import * as orderController from "../controllers/orderController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-order", verifyToken, (req: Request, res: Response) => {
    orderController.createOrderController(req, res);
});
router.get("/get-order-by-id", verifyToken, (req: Request, res: Response) => {
    orderController.getOrderByIdController(req, res);
});
router.get("/get-orders", verifyToken, (req: Request, res: Response) => {
    orderController.getOrdersController(req, res);
});
router.put("/update-order-status", verifyToken, (req: Request, res: Response) => {
    orderController.updateOrderStatusController(req, res);
});

export default router;