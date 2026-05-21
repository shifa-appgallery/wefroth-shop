// src/controllers/size.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Size } from "../entities/Size";
import { AuthRequest } from "../middleware/authorization";

const sizeRepo = AppDataSource.getRepository(Size);

/**
 * CREATE SIZE
 */
export const createSize = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, is_active } = req.body;

    const alreadyExist = await sizeRepo.findOne({
      where: {
        name,
      },
    });

    if (alreadyExist) {
      return res.status(409).json({
        success: false,
        message: "Size already exists",
      });
    }

    const size = sizeRepo.create({
      name,
      is_active,
    });

    const data = await sizeRepo.save(size);

    return res.status(201).json({
      success: true,
      message: "Size created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL SIZES
 */
export const getAllSizes = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await sizeRepo.find({
      order: {
        created_at: "DESC",
      },
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET SIZE BY ID
 */
export const getSizeById = async (
  req: Request,
  res: Response
) => {
  try {
    const sizeId = Number(req.query.sizeId);

    const data = await sizeRepo.findOne({
      where: {
        sizeId,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE SIZE
 */
export const updateSize = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sizeId = Number(req.query.sizeId);

    const { name, is_active } = req.body;

    const existingSize = await sizeRepo.findOne({
      where: {
        sizeId,
      },
    });

    if (!existingSize) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    if (
      name &&
      name !== existingSize.name
    ) {
      const alreadyExist = await sizeRepo.findOne({
        where: {
          name,
        },
      });

      if (alreadyExist) {
        return res.status(409).json({
          success: false,
          message: "Size already exists",
        });
      }
    }

    existingSize.name =
      name ?? existingSize.name;

    existingSize.is_active =
      is_active ?? existingSize.is_active;

    const updatedData = await sizeRepo.save(
      existingSize
    );

    return res.status(200).json({
      success: true,
      message: "Size updated successfully",
      data: updatedData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE SIZE
 */
export const deleteSize = async (
  req: Request,
  res: Response
) => {
  try {
    const sizeId = Number(req.query.sizeId);

    const existingSize = await sizeRepo.findOne({
      where: {
        sizeId,
      },
    });

    if (!existingSize) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    await sizeRepo.remove(existingSize);

    return res.status(200).json({
      success: true,
      message: "Size deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};