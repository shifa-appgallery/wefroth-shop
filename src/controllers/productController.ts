import { Request, Response } from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../service/productService";
import { AuthRequest } from "../middleware/authorization";

export const createProductController = async (
    req: AuthRequest, res: Response
) => {
    try {
        const userId = req.user.id;

        const response = await createProduct(req.body,userId);

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
}
export const getProductsController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const response = await getProducts();

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

export const updateProductController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user.id;

        const response = await updateProduct(
            req.query.productId as string,
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

export const deleteProductController = async (
    req: Request,
    res: Response
) => {
    try {
        await deleteProduct(req.query.productId as string);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};