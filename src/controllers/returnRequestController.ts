import { Response } from "express";
import * as returnRequestService from "../service/returnRequestService";
import { AuthRequest } from "../middleware/authorization";

export const createReturnRequestConrtoller = async (req: AuthRequest, res: Response) => {
    try {
        const data = await returnRequestService.createReturnRequest(
            req.body,
            req.user.id
        );

        return res.status(201).json({
            success: true,
            message: "Return request created successfully",
            data
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

export const getSellerReturnRequests = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const sellerId = req.user.id;
        const status = req.query.status as string;

        const data =
            await returnRequestService.getSellerReturnRequest(
                sellerId,
                status
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

export const approveRejectReturnRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { action } = req.body;

    let data;

    switch (action) {
      case "CREATE":
        data = await returnRequestService.createReturnRequest(
          req.body,
          req.user.userId
        );
        break;

      case "APPROVE":
      case "REJECT":
        data = await returnRequestService.approveRejectReturnRequest(
          req.body,
          req.user.userId
        );
        break;

      default:
        throw new Error("Invalid action");
    }

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

export const shipReturnProduct = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const data = await returnRequestService.shipReturnProduct(
            req.body,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error: any) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

export const receiveReturnProduct = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const data = await returnRequestService.receiveReturnProduct(
            req.body,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error: any) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

export const refundReturnRequest = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const data =
            await returnRequestService.refundReturnRequest(
                req.body,
                req.user.sellerId,   // Seller ID
                req.user.userId      // Logged-in User ID
            );

        return res.status(200).json({
            success: true,
            message: data.message,
            data,
        });

    } catch (error: any) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};