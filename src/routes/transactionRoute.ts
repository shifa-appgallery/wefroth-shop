import { Router } from "express";
import { Request, Response } from "express";

import * as transactionController from "../controllers/transactionController"
import { verifyToken } from "../middleware/authorization";

const router = Router();

router.post("/create-transaction", verifyToken, (req: Request, res: Response) => {
    transactionController.createTransaction(req, res);
});
router.get("/get-transaction", (req: Request, res: Response) => {
    transactionController.getTransactions(req, res);
});
router.get("/get-transaction-by-id", (req: Request, res: Response) => {
    transactionController.getTransactionById(req, res);
});
router.put("/update-transaction", verifyToken, (req: Request, res: Response) => {
    transactionController.updateTransaction(req, res);
});
router.delete("/delete-transaction", verifyToken, (req: Request, res: Response) => {
    transactionController.deleteTransaction(req, res);
});
router.post("/create-square-payment", verifyToken, (req: Request, res: Response) => {
    transactionController.createSquarePayment(req, res);
});
router.post("/refund-transaction", verifyToken, (req: Request, res: Response) => {
    transactionController.refundTransaction(req, res);
});


export default router;