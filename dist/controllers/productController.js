"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductController = exports.updateProductController = exports.getProductsController = exports.createProductController = void 0;
const productService_1 = require("../service/productService");
const createProductController = async (req, res) => {
    try {
        const userId = req.user._id;
        const response = await (0, productService_1.createProduct)(req.body, userId);
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
exports.createProductController = createProductController;
const getProductsController = async (req, res) => {
    try {
        const response = await (0, productService_1.getProducts)();
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
exports.getProductsController = getProductsController;
const updateProductController = async (req, res) => {
    try {
        const userId = req.user._id;
        const response = await (0, productService_1.updateProduct)(req.query.productId, req.body, userId);
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
exports.updateProductController = updateProductController;
const deleteProductController = async (req, res) => {
    try {
        await (0, productService_1.deleteProduct)(req.query.productId);
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteProductController = deleteProductController;
