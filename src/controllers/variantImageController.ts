import { Auth } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { VariantImage } from "../entities/VanriantImage";
import { AuthRequest } from "../middleware/authorization";
import { Response } from "express";
import { ProductVariant } from "../entities/ProductVariant";

const variantImageRepo = AppDataSource.getRepository(VariantImage);
const productVariantRepo = AppDataSource.getRepository(ProductVariant);


export const createImage = async (req: AuthRequest, res: Response) => {
    try {

        const {
            variantId,
            image_url,
            alt_text,
            is_active,
        } = req.body;

        const userId = req.user?.id;

        const variant = await productVariantRepo.findOne({
            where: {
                variantId,
            },
        });

        if (!variant) {
            throw new Error("Variant not found");
        }

        const image = variantImageRepo.create({
            image_url,
            alt_text,
            is_active,
            created_by: userId,
            variant,
        });

        const data = await variantImageRepo.save(image);

        return res.status(201).json({
            success: true,
            message: "Image created successfully",
            data: data
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const getImagesById = async (req: AuthRequest, res: Response) => {
    try {
        const variantImageId = Number(req.query.variantImageId);

        const image = await variantImageRepo.findOne({
            where: {
                variantImageId,
            },
            relations: ["variant"],
        });

        if (!image) {
            throw new Error("Image not found");
        }

        return res.status(200).json({
            success: true,
            message: "Image get successfully",
            data: image
        });

    } catch (error) {
        return res.status(500).json({
            succuss: false,
            message: error.message
        })
    }
}

export const updateImage = async (req: AuthRequest, res: Response) => {
    try {
        const variantImageId = Number(req.query.variantImageId);

        const { image_url, alt_text, is_active } = req.body;

        const existingImage = await variantImageRepo.findOne({
            where: {
                variantImageId,
            },
        });

        if (!existingImage) {
            return res.status(404).json({
                success: false,
                message: "Variant image not found",
            });
        }

        // check duplicate image_url
        if (
            image_url &&
            image_url !== existingImage.image_url
        ) {
            const alreadyExist = await variantImageRepo.findOne({
                where: {
                    image_url,
                },
            });

            if (alreadyExist) {
                return res.status(409).json({
                    success: false,
                    message: "Image already exists",
                });
            }
        }

        // update only if payload value exists
        existingImage.image_url =
            image_url ?? existingImage.image_url;

        existingImage.alt_text =
            alt_text ?? existingImage.alt_text;

        existingImage.is_active =
            is_active ?? existingImage.is_active;

        existingImage.updated_by = Number(req.user?.id);

        const updatedImage = await variantImageRepo.save(
            existingImage
        );

        return res.status(200).json({
            success: true,
            message: "Variant image updated successfully",
            data: updatedImage,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteImage = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const variantImageId = Number(
            req.query.variantImageId
        );

        const existingImage = await variantImageRepo.findOne({
            where: {
                variantImageId,
            },
        });

        if (!existingImage) {
            return res.status(404).json({
                success: false,
                message: "Variant image not found",
            });
        }

        await variantImageRepo.remove(existingImage);

        return res.status(200).json({
            success: true,
            message: "Variant image deleted successfully",
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};