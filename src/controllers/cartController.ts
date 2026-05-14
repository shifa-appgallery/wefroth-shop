import { Response } from "express";
import { AuthRequest } from "../middleware/authorization";
import { CommandSucceededEvent } from "typeorm";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../service/cartService";

export const addToCartController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const response = await addToCart(req.body, userId);

        return res.status(201).json({
            success: true,
            data: response,
        })
    } catch(error){
        return res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}

export const getCartController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const response = await getCart(userId);

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

export const updateCartItemController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const response = await updateCartItem(
      String(req.query.cartItemId),
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

export const removeCartItemController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await removeCartItem(Number(req.query.cartItemId));

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const clearCartController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    await clearCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};