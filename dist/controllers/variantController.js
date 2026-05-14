"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariantController = exports.updateVariantController = exports.getVariantsController = exports.createVariantController = void 0;
const variantService_1 = require("../service/variantService");
const createVariantController = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await (0, variantService_1.createVariant)(req.body, userId);
        return res.status(201).json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createVariantController = createVariantController;
const getVariantsController = async (req, res) => {
    try {
        const response = await (0, variantService_1.getVariants)();
        return res.status(200).json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getVariantsController = getVariantsController;
const updateVariantController = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await (0, variantService_1.updateVariant)(req.params.variantId, req.body, userId);
        return res.status(200).json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateVariantController = updateVariantController;
const deleteVariantController = async (req, res) => {
    try {
        await (0, variantService_1.deleteVariant)(req.query.variantId);
        return res.status(200).json({
            success: true,
            message: "Variant deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteVariantController = deleteVariantController;
