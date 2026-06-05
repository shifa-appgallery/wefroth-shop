import { Response } from "express";

import { AuthRequest } from "../middleware/authorization";
import { createShopProfile, deleteShopProfile, getShopProfileDetails, getShopProfiles, updateShopProfile } from "../service/shopProfileService";

export const createShopProfileController = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const userId = Number(req.user.id);

    const response = await createShopProfile(
      req.body,
      userId
    );

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
};

export const getShopProfilesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const teamId = req.query.teamId
      ? parseInt(req.query.teamId as string)
      : undefined;

    const response = await getShopProfiles(teamId);

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

export const updateShopProfileController = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const userId = Number(req.user.id);

    const response = await updateShopProfile(
      Number(req.query.shopProfileId),
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

export const deleteShopProfileController = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    await deleteShopProfile(
      String(req.query.shopProfileId)
    );

    return res.status(200).json({
      success: true,
      message: "Shop profile deleted successfully",
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getShopProfileDetailsController = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.query;

    const data = await getShopProfileDetails(
      Number(teamId)
    );

    return res.status(200).json({
      success: true,
      message: "Shop profile fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};