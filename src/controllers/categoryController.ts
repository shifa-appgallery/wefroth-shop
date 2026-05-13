import { Request, Response } from "express";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../service/categoryService";
import { AuthRequest } from "../middleware/authorization";

export const createCategoryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;
    console.log("userId",userId)
    const response = await createCategory(req.body, userId);
console.log("response",response)
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
  req: Request,
  res: Response
) => {
  try {
    const response = await getCategories();

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

export const deleteCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteCategory(Number(req.query.categoryId));

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};