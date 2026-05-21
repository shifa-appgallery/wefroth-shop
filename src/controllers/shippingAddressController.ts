import { Response } from "express";
import { AuthRequest } from "../middleware/authorization";
import { createShippingAddress, getMyAddressess, getAddressById, updateAddress, deleteAddress, setDefaultAddress } from "../service/shippingAddressService";

export const createShippingAddresController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const response = await createShippingAddress(req.body, userId);

        return res.status(201).json({
            success: true,
            data: response,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const getMyAddress = async (req: AuthRequest, res: Response) => {
    try {
        const data = await getMyAddressess(req.user.id);
        res.json({ success: true, data });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyAddressById = async (req: AuthRequest, res: Response) => {
    try {
        const data = await getAddressById(Number(req.query.shippingAddressId), req.user.id);
        return res.status(200).json
            ({
                success: true,
                data
            });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const updateMyAddress = async (req: AuthRequest, res: Response) => {
    try {
        const data = await updateAddress(
            Number(req.query.shippingAddressId),
            req.body,
            req.user.id
        );
        return res.status(200).json
            ({
                success: true,
                data
            });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const removeAddress = async (req: AuthRequest, res: Response) => {
    try {
        const data = await deleteAddress(Number(req.query.shippingAddressId), req.user.id);
        return res.status(200).json
            ({
                success: true,
                data
            });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

};

export const setDefault = async (req: AuthRequest, res: Response) => {
    try {
        const data = await setDefaultAddress(
            Number(req.query.shippingAddressId),
            req.user.id
        );
         return res.status(200).json
            ({
                success: true,
                data
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

};