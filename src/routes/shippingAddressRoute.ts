import { Router } from "express";
import { Request, Response } from "express";

import * as shippingAddressController from "../controllers/shippingAddressController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-shipping-address", verifyToken, (req: Request, res: Response) => {
    shippingAddressController.createShippingAddresController(req, res);
});

router.get("/get-address", verifyToken, (req: Request, res: Response) => {
    shippingAddressController.getMyAddress(req, res);
});

router.get("/get-address-by-id", verifyToken, (req: Request, res: Response) => {
    shippingAddressController.getMyAddressById(req, res);
});

router.delete("/remove-address", verifyToken, (req: Request, res: Response) => {
    shippingAddressController.removeAddress(req, res);
});

router.put("/update-address", verifyToken, (req: Request, res: Response) => {
    shippingAddressController.updateMyAddress(req, res);
});

router.patch("/set-default-address", verifyToken, (req: Request, res: Response) => {
    shippingAddressController.setDefault(req, res);
});

export default router;