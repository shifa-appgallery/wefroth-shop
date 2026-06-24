import { Response } from "express";
import { AuthRequest } from "../middleware/authorization";
import { createOrder, getOrderById, getOrderDetails, getOrderList, getOrders, updateOrderStatus } from "../service/orderService";

export const createOrderController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;
    const response = await createOrder(req.body, userId);
    return res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getOrdersController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;
    const orderId =
      req.query.orderId ? Number(req.query.orderId) : undefined;

    const response = await getOrders(userId, orderId);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderByIdController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const response = await getOrderById(Number(req.query.orderId));

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatusController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const response = await updateOrderStatus(
      Number(req.query.orderId),
      req.body,
      userId
    );

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderDetailsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;
    const orderId = Number(req.query.orderId);

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const response = await getOrderDetails(
      userId,
      orderId
    );

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderListController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const offset = Number(req.query.offset || 0);
    const limit = Number(req.query.limit || 10);

    const status = req.query.status as string;

    const response = await getOrderList(
      userId,
      offset,
      limit,
      status
    );

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};