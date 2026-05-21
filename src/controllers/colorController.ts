// src/controllers/color.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Color } from "../entities/Color";
import { AuthRequest } from "../middleware/authorization";

const colorRepo = AppDataSource.getRepository(Color);

/**
 * CREATE COLOR
 */
export const createColor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, hex_code, is_active } = req.body;

    const alreadyExist = await colorRepo.findOne({
      where: {
        name,
      },
    });

    if (alreadyExist) {
      return res.status(409).json({
        success: false,
        message: "Color already exists",
      });
    }

    const color = colorRepo.create({
      name,
      hex_code,
      is_active,
    });

    const data = await colorRepo.save(color);

    return res.status(201).json({
      success: true,
      message: "Color created successfully",
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
 * GET ALL COLORS
 */
export const getAllColors = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await colorRepo.find({
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
 * GET COLOR BY ID
 */
export const getColorById = async (
  req: Request,
  res: Response
) => {
  try {
    const colorId = Number(req.query.colorId);

    const data = await colorRepo.findOne({
      where: {
        colorId,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
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
 * UPDATE COLOR
 */
export const updateColor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const colorId = Number(req.query.colorId);

    const { name, hex_code, is_active } = req.body;

    const existingColor = await colorRepo.findOne({
      where: {
        colorId,
      },
    });

    if (!existingColor) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
      });
    }

    if (
      name &&
      name !== existingColor.name
    ) {
      const alreadyExist = await colorRepo.findOne({
        where: {
          name,
        },
      });

      if (alreadyExist) {
        return res.status(409).json({
          success: false,
          message: "Color already exists",
        });
      }
    }

    existingColor.name =
      name ?? existingColor.name;

    existingColor.hex_code =
      hex_code ?? existingColor.hex_code;

    existingColor.is_active =
      is_active ?? existingColor.is_active;

    const updatedData = await colorRepo.save(
      existingColor
    );

    return res.status(200).json({
      success: true,
      message: "Color updated successfully",
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
 * DELETE COLOR
 */
export const deleteColor = async (
  req: Request,
  res: Response
) => {
  try {
    const colorId = Number(req.query.colorId);

    const existingColor = await colorRepo.findOne({
      where: {
        colorId,
      },
    });

    if (!existingColor) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
      });
    }

    await colorRepo.remove(existingColor);

    return res.status(200).json({
      success: true,
      message: "Color deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};