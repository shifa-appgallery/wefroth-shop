import { Request, Response } from "express";
import { createCategory, getCategories, updateCategory, updateCategoryOrder, updateCategoryStatus } from "../service/categoryService";
import { AuthRequest } from "../middleware/authorization";

export const createCategoryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;
    const response = await createCategory(req.body, userId);
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

export const getCategoriesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    let isActive: boolean | undefined;
    let type: string | undefined;
    let isAdmin: boolean | false;

    if (req.query.isActive !== undefined) {
      isActive = req.query.isActive === "true";
    }

    if (req.query.type) {
      type = String(req.query.type);
    }

    if (req.query.isAdmin) {
      isAdmin = req.query.isAdmin === "true";
    }

    const response = await getCategories(isActive, type, isAdmin);

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

export const updateCategoryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const response = await updateCategory(
      Number(req.query.categoryId),
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

export const updateCategoryStatusController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const isActive =
      req.query.isActive === "true";
    const userId = req.user.id;
    await updateCategoryStatus(Number(req.query.categoryId), isActive, userId);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategoryOrderController = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const userId = Number(req.user?.id);

    const categoryOrder = req.body.categoryOrder;

    if (!Array.isArray(categoryOrder) || categoryOrder.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    await updateCategoryOrder(
      categoryOrder,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Category order updated successfully",
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};