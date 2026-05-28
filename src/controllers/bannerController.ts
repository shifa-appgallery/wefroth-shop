import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Banner } from "../entities/Banner";
import { AuthRequest } from "../middleware/authorization";

const bannerRepository = AppDataSource.getRepository(Banner)

export const createBannerController = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const {
            image_url,
        } = req.body;

        // CREATE BANNER
        const banner =
            bannerRepository.create({
                image_url,
                is_active: true,
                created_by:
                    req.user.id,
            });

        const savedBanner =
            await bannerRepository.save(
                banner
            );

        return res.status(201).json({
            success: true,
            message:
                "Banner created successfully",
            data: savedBanner,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getBannersController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const banners =
            await bannerRepository.find({
                where: {
                    is_active: true,
                },
            });
        return res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};