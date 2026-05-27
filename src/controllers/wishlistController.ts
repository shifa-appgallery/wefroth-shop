import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Wishlist } from "../entities/Wishlist";
import { AuthRequest } from "../middleware/authorization";
const wishListRepo = AppDataSource.getRepository(Wishlist);

export const createWishList = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.body;
        const userId = req.user?.id;

        const existWishList = await wishListRepo.findOne({
            where: {
                user_id: userId,
                product: {
                    productId,
                },
            },
            relations: ["product"],
        })
        if (existWishList) {
            throw new Error("Product already there in wishlist.");
        }

        const data = wishListRepo.create({
            user_id: userId,
            product: { productId },
            is_active: true,
            created_by:userId
        });
        const savedData = await wishListRepo.save(data);

        return res.status(201).json({
            success: true,
            data: savedData,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const getWishList = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const wishlist = await wishListRepo.find({
      where: {
        user_id: userId,
        is_active: true,
      },
      relations: [
        "product",
        "product.category",
        "product.media",
        "product.variants",
        "product.variants.variantImages",
        "product.variants.size",
        "product.variants.color",
      ],
      order: {
        created_at: "DESC",
      },
    });

    return res.status(200).json({
      success: true,
      total: wishlist.length,
      data: wishlist,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeFromWishList = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { productId } = req.query;

    const userId = req.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const wishlistItem = await wishListRepo.findOne({
      where: {
        user_id: userId,
        product: {
          productId: Number(productId),
        },
        is_active: true,
      },
      relations: ["product"],
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Soft remove
    wishlistItem.is_active = false;

    await wishListRepo.save(wishlistItem);

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};