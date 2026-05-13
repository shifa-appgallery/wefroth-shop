"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProducts = exports.createProduct = void 0;
const data_source_1 = require("../config/data-source");
const Product_1 = require("../entities/Product");
const productRepository = data_source_1.AppDataSource.getRepository(Product_1.Product);
const createProduct = async (body, userId) => {
    const product = productRepository.create({
        productName: body.productName,
        description: body.description,
        seller_type: body.seller_type,
        seller_id: body.seller_id,
        category: {
            categoryId: body.categoryId,
        },
        base_price: body.base_price,
        currency: body.currency || "AUD",
        created_by: userId,
    });
    return await productRepository.save(product);
};
exports.createProduct = createProduct;
const getProducts = async () => {
    return await productRepository.find({
        relations: ["category", "variants", "images"],
        where: {
            is_active: true,
        },
    });
};
exports.getProducts = getProducts;
const updateProduct = async (productId, body, userId) => {
    await productRepository.update(productId, {
        productName: body.productName,
        description: body.description,
        base_price: body.base_price,
        currency: body.currency,
        updated_by: userId,
    });
    return await productRepository.findOne({
        where: { productId },
        relations: ["category", "variants", "images"],
    });
};
exports.updateProduct = updateProduct;
const deleteProduct = async (productId) => {
    await productRepository.update(productId, {
        is_active: false,
    });
    return true;
};
exports.deleteProduct = deleteProduct;
