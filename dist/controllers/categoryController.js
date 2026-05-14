"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryController = exports.updateCategoryController = exports.getCategoriesController = exports.createCategoryController = void 0;
const categoryService_1 = require("../service/categoryService");
const createCategoryController = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("userId", userId);
        const response = await (0, categoryService_1.createCategory)(req.body, userId);
        console.log("response", response);
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
exports.createCategoryController = createCategoryController;
const getCategoriesController = async (req, res) => {
    try {
        const response = await (0, categoryService_1.getCategories)();
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
exports.getCategoriesController = getCategoriesController;
const updateCategoryController = async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await (0, categoryService_1.updateCategory)(Number(req.query.categoryId), req.body, userId);
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
exports.updateCategoryController = updateCategoryController;
const deleteCategoryController = async (req, res) => {
    try {
        await (0, categoryService_1.deleteCategory)(Number(req.query.categoryId));
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteCategoryController = deleteCategoryController;
