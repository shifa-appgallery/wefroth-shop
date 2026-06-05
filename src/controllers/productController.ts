import { Request, Response } from "express";
import { createProduct, deleteProduct, getNewArrivalProducts, getProductDetails, getProducts, updateProduct } from "../service/productService";
import { AuthRequest } from "../middleware/authorization";

export const createProductController = async (
    req: AuthRequest, res: Response
) => {
    try {
        const userId = req.user.id;

        const response = await createProduct(req.body, userId);

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

        const {
            offset = 0,
            limit = 10,
            categoryId,
            gender,
            categorySlug,
            sizeId,
            colorId,
            discount,
            searchTerm,
            type

        } = req.query;
        const userId = req.user?.id
            ? Number(req.user.id)
            : null;

        const response = await getProducts(
            Number(offset),
            Number(limit),
            categoryId ? Number(categoryId) : undefined,
            gender ? String(gender) : undefined,
            categorySlug ? String(categorySlug) : undefined,
            sizeId ? Number(sizeId) : undefined,
            colorId ? Number(colorId) : undefined,
            discount ? Number(discount) : undefined,
            searchTerm ? String(searchTerm) : undefined,
            type ? String(type) : undefined,
            userId
        );

        return res.status(200).json({
            success: true,
            total: response.total,
            offset: response.offset,
            limit: response.limit,
            data: response.data,
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
            Number(req.query.productId),
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

export const getProductsDetailsController = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const {
            teamId,
            searchTerm,
            categoryId,
            offset = 0,
            limit = 10,
        } = req.query;

        const response = await getProductDetails({
            teamId: Number(teamId),
            searchTerm: String(searchTerm || ""),
            categoryId: String(categoryId || ""),
            offset: Number(offset),
            limit: Number(limit),
        });


        return res.status(200).json({
            success: true,
            ...response,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const getNewArrivalProductsController =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {

            const userId = req.user?.id || null;

            const {
                offset = 0,
                limit = 10,
            } = req.query;

            const response =
                await getNewArrivalProducts(
                    userId,
                    Number(offset),
                    Number(limit)
                );

            return res.status(200).json({
                success: true,
                ...response,
            });

        } catch (error: any) {

            return res.status(500).json({
                success: false,
                message: error.message,
            });

        }
    };