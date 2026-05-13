"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const data_source_1 = require("../config/data-source");
const Category_1 = require("../entities/Category");
const categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
const createCategory = async (body, userId) => {
    const category = categoryRepository.create({
        categoryName: body.categoryName,
        slug: body.slug,
        level: body.parent ? 2 : 1,
        parent: body.parent ? { categoryId: body.parent } : null,
        sort_order: body.sort_order || 0,
        created_by: userId,
    });
    return await categoryRepository.save(category);
};
exports.createCategory = createCategory;
const getCategories = async () => {
    return await categoryRepository.find({
        relations: ["parent", "children"],
        where: {
            is_active: true,
        },
        order: {
            sort_order: "ASC",
        },
    });
};
exports.getCategories = getCategories;
const updateCategory = async (categoryId, body, userId) => {
    await categoryRepository.update(categoryId, {
        categoryName: body.categoryName,
        slug: body.slug,
        sort_order: body.sort_order,
        updated_by: userId,
    });
    return await categoryRepository.findOne({
        where: { categoryId },
    });
};
exports.updateCategory = updateCategory;
const deleteCategory = async (categoryId) => {
    await categoryRepository.update(categoryId, {
        is_active: false,
    });
    return true;
};
exports.deleteCategory = deleteCategory;
