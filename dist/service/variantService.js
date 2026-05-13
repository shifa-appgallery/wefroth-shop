"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariant = exports.updateVariant = exports.getVariants = exports.createVariant = void 0;
const data_source_1 = require("../config/data-source");
const ProductVarient_1 = require("../entities/ProductVarient");
const variantRepository = data_source_1.AppDataSource.getRepository(ProductVarient_1.ProductVariant);
const createVariant = async (body, userId) => {
    const variant = variantRepository.create({
        product: {
            productId: body.productId,
        },
        name: body.name,
        sku: body.sku,
        price: body.price,
        stock: body.stock,
        attributes: body.attributes,
        created_by: userId,
    });
    return await variantRepository.save(variant);
};
exports.createVariant = createVariant;
const getVariants = async () => {
    return await variantRepository.find({
        relations: ["product"],
    });
};
exports.getVariants = getVariants;
const updateVariant = async (variantId, body, userId) => {
    await variantRepository.update(variantId, {
        name: body.name,
        sku: body.sku,
        price: body.price,
        stock: body.stock,
        attributes: body.attributes,
        updated_by: userId,
    });
    return await variantRepository.findOne({
        where: { variantId },
    });
};
exports.updateVariant = updateVariant;
const deleteVariant = async (variantId) => {
    await variantRepository.delete(variantId);
    return true;
};
exports.deleteVariant = deleteVariant;
