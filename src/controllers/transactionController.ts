import { Request, Response } from "express";

import * as transactionService from "../service/transaction.service";
import { AuthRequest } from "../middleware/authorization";

export const createTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = Number(req.user.id);

    const data = await transactionService.createTransaction(
      req.body,
      userId
    );

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 10;

    const data =
      await transactionService.getTransactions(
        offset,
        limit
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransactionById = async (
  req: Request,
  res: Response
) => {
  try {
    const transactionId = Number(
      req.query.transactionId
    );

    const data =
      await transactionService.getTransactionById(
        transactionId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;

    const transactionId = Number(
      req.query.transactionId
    );

    const data =
      await transactionService.updateTransaction(
        transactionId,
        req.body,
        userId
      );

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;

    const transactionId = Number(
      req.query.transactionId
    );

    const data =
      await transactionService.deleteTransaction(
        transactionId,
        userId
      );

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const createSquarePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;

    const data =
      await transactionService.createSquarePayment(
        req.body,
        userId
      );

    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const refundTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;

    const transactionId = Number(
      req.query.transactionId
    );

    const { amount } = req.body;

    const data =
      await transactionService.refundTransaction(
        transactionId,
        amount,
        userId
      );

    return res.status(200).json({
      success: true,
      message: "Refund successful",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};