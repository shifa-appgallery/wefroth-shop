// controllers/productReviewController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { ProductReview } from "../entities/ProductReview";
import { Product } from "../entities/Product";
import { AuthRequest } from "../middleware/authorization";

const productReviewRepository =
    AppDataSource.getRepository(ProductReview);

const productRepository =
    AppDataSource.getRepository(Product);



// CREATE REVIEW
export const createProductReview = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const {
            productId,
            rating,
            review,
            is_approved,
            is_active,
        } = req.body;

        const userId: any = req.user?.id;

        if (!productId) {
            return res.status(400).json({
                status: false,
                message: "productId is required"
            });
        }

        const product = await productRepository.findOne({
            where: { productId }
        });

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }

        // CHECK EXISTING REVIEW
        const existingReview =
            await productReviewRepository.findOne({
                where: {
                    product: {
                        productId
                    },
                    user_id: Number(userId)
                },
                relations: ["product"]
            });

        if (existingReview) {
            return res.status(400).json({
                status: false,
                message: "Review already submitted"
            });
        }

        const productReview =
            productReviewRepository.create({

                product: {
                    productId
                },

                user_id: Number(userId),

                rating,

                review,

                is_approved:
                    is_approved ?? true,

                is_active:
                    is_active ?? true,

                created_by: userId
            });

        const savedReview =
            await productReviewRepository.save(
                productReview
            );

        return res.status(201).json({
            status: true,
            message: "Review created successfully",
            data: savedReview
        });

    } catch (error: any) {

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }
};

// GET ALL REVIEWS
export const getAllProductReviews = async (
    req: Request,
    res: Response
) => {
    try {

        const reviews =
            await productReviewRepository.find({
                relations: ["product"],
                order: {
                    created_at: "DESC"
                }
            });

        return res.status(200).json({
            status: true,
            data: reviews
        });

    } catch (error: any) {

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }
};

// GET REVIEW BY ID
export const getProductReviewById = async (
    req: Request,
    res: Response
) => {
    try {

        const reviewId = Number(req.query.reviewId);

        const review =
            await productReviewRepository.findOne({
                where: { reviewId },
                relations: ["product"]
            });

        if (!review) {
            return res.status(404).json({
                status: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            status: true,
            data: review
        });

    } catch (error: any) {

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }
};



// UPDATE REVIEW
export const updateProductReview = async (
    req: AuthRequest,
    res: Response
) => {
    try {

        const reviewId = Number(req.query.reviewId);

        const {
            rating,
            review,
            is_approved,
            is_active
        } = req.body;

        const userId: any = req.user?.id;

        const existingReview =
            await productReviewRepository.findOne({
                where: { reviewId }
            });

        if (!existingReview) {
            return res.status(404).json({
                status: false,
                message: "Review not found"
            });
        }

        await productReviewRepository.update(
            reviewId,
            {
                rating:
                    rating ?? existingReview.rating,

                review:
                    review ?? existingReview.review,

                is_approved:
                    is_approved ??
                    existingReview.is_approved,

                is_active:
                    is_active ??
                    existingReview.is_active,

                updated_by: userId
            }
        );

        const updatedReview =
            await productReviewRepository.findOne({
                where: { reviewId },
                relations: ["product"]
            });

        return res.status(200).json({
            status: true,
            message: "Review updated successfully",
            data: updatedReview
        });

    } catch (error: any) {

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }
};

// DELETE REVIEW
export const deleteProductReview = async (
    req: Request,
    res: Response
) => {
    try {

        const reviewId = Number(req.query.reviewId);

        const existingReview =
            await productReviewRepository.findOne({
                where: { reviewId }
            });

        if (!existingReview) {
            return res.status(404).json({
                status: false,
                message: "Review not found"
            });
        }

        await productReviewRepository.delete(
            reviewId
        );

        return res.status(200).json({
            status: true,
            message: "Review deleted successfully"
        });

    } catch (error: any) {

        return res.status(500).json({
            status: false,
            message: error.message
        });

    }
};