import { Request, Response } from "express";
import { createVariant, deleteVariant, getVariants, updateVariant } from "../service/variantService";
import { AuthRequest } from "../middleware/authorization";

export const createVariantController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const response = await createVariant(req.body, userId);

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
export const getVariantsController = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await getVariants();

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

export const updateVariantController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const response = await updateVariant(
      req.params.variantId as string,
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

export const deleteVariantController = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteVariant(req.query.variantId as string);

    return res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};