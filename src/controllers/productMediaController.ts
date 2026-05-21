import { Response } from "express";
import { AuthRequest } from "../middleware/authorization";
import { AppDataSource } from "../config/data-source";
import { ProductMedia } from "../entities/ProductMedia";
import { Product } from "../entities/Product";

const mediaRepository = AppDataSource.getRepository(ProductMedia);
const productRepository = AppDataSource.getRepository(Product);

export const createProductMedia = async (req: AuthRequest, res: Response) => {
    try {
        const {
            productId,
            media_url,
            media_type,
            sort_order,
            is_thumbnail,
            alt_text,
            video_thumbnail,
        } = req.body;

        const userId = req.user.id;

        const product = await productRepository.findOne({
            where: { productId },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            })
        }
        const media = mediaRepository.create({
            product,
            media_url,
            media_type,
            sort_order,
            is_thumbnail,
            alt_text,
            video_thumbnail,
            created_by: userId,
        });

        await mediaRepository.save(media);

        return res.status(201).json({
            success: true,
            message: "Product media created successfully",
            data: media,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const getAllProductMedia = async (req: AuthRequest, res: Response) => {
    try {
        const media = await mediaRepository.find({
            relations: ["product"],
            order: {
                sort_order: "ASC",
            },
        });

        return res.status(200).json({
            success: true,
            data: media
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const getProductMediaById = async (req: AuthRequest, res: Response) => {
    try {
        const { mediaId } = req.query;
        let productMediaId = Number(mediaId);

        const media = await mediaRepository.findOne({
            where: { mediaId: productMediaId },
            relations: ["product"],
        });

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Product media not found",
            });
        }
        mediaRepository.merge(media, req.body);

        await mediaRepository.save(media);

        return res.status(200).json({
            success: true,
            message: "Product media updated successfully",
            data: media,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const updateProductMedia = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { mediaId } = req.query;
        let productMediaId = Number(mediaId);

        const userId = req.user.id;

        const media = await mediaRepository.findOne({
            where: { mediaId: productMediaId },
        });

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Product media not found",
            });
        }

        mediaRepository.merge(media, {
            ...req.body,
            updated_by: userId,
        });

        await mediaRepository.save(media);

        return res.status(200).json({
            success: true,
            message: "Product media updated successfully",
            data: media,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update product media",
            error,
        });
    }
};

export const deleteProductMedia = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { mediaId } = req.query;
        let productMediaId = Number(mediaId);

        const media = await mediaRepository.findOne({
            where: { mediaId: productMediaId },
        });

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Product media not found",
            });
        }

        await mediaRepository.remove(media);

        return res.status(200).json({
            success: true,
            message: "Product media deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete product media",
            error,
        });
    }
};