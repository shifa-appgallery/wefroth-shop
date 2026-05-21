// src/controllers/gender.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Gender } from "../entities/Gender";
import { AuthRequest } from "../middleware/authorization";

const genderRepo = AppDataSource.getRepository(Gender);

/**
 * CREATE GENDER
 */
export const createGender = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const {
      name,
      is_active,
    } = req.body;

    const alreadyExist = await genderRepo.findOne({
      where: {
        name,
      },
    });

    if (alreadyExist) {
      return res.status(409).json({
        success: false,
        message: "Gender already exists",
      });
    }

    const gender = genderRepo.create({
      name,
      is_active,
    });

    const data = await genderRepo.save(gender);

    return res.status(201).json({
      success: true,
      message: "Gender created successfully",
      data,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


export const getAllGenders = async (
  req: Request,
  res: Response
) => {
  try {

    const data = await genderRepo.find({
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
 * GET GENDER BY ID
 */
export const getGenderById = async (
  req: Request,
  res: Response
) => {
  try {

    const genderId = Number(req.query.genderId);

    const data = await genderRepo.findOne({
      where: {
        genderId,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Gender not found",
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
 * UPDATE GENDER
 */
export const updateGender = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const genderId = Number(req.query.genderId);

    const {
      name,
      is_active,
    } = req.body;

    const existingGender = await genderRepo.findOne({
      where: {
        genderId,
      },
    });

    if (!existingGender) {
      return res.status(404).json({
        success: false,
        message: "Gender not found",
      });
    }

    // duplicate check
    if (
      name &&
      name !== existingGender.name
    ) {

      const alreadyExist = await genderRepo.findOne({
        where: {
          name,
        },
      });

      if (alreadyExist) {
        return res.status(409).json({
          success: false,
          message: "Gender already exists",
        });
      }
    }

    existingGender.name =
      name ?? existingGender.name;

    existingGender.is_active =
      is_active ?? existingGender.is_active;

    const updatedGender = await genderRepo.save(
      existingGender
    );

    return res.status(200).json({
      success: true,
      message: "Gender updated successfully",
      data: updatedGender,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/**
 * DELETE GENDER
 */
export const deleteGender = async (
  req: Request,
  res: Response
) => {
  try {

    const genderId = Number(req.query.genderId);

    const existingGender = await genderRepo.findOne({
      where: {
        genderId,
      },
    });

    if (!existingGender) {
      return res.status(404).json({
        success: false,
        message: "Gender not found",
      });
    }

    await genderRepo.remove(existingGender);

    return res.status(200).json({
      success: true,
      message: "Gender deleted successfully",
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};