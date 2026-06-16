import { AppDataSource } from "../config/data-source";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItems";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";

const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);
const productRepository = AppDataSource.getRepository(Product);
const variantRepository = AppDataSource.getRepository(ProductVariant);

export const addToCart = async (body: any, userId: number) => {
    let cart = await cartRepository.findOne({
        where: {
            user_id: userId,
            is_active: true,
        },
        relations: ["items"],
    })

    if (!cart) {
        cart = cartRepository.create({
            user_id: userId,
            created_by: userId,
        });

        cart = await cartRepository.save(cart)
    }
    const product = await productRepository.findOne({
        where: {
            productId: body.productId,
        },
        relations: [
            "category",
            "media",
        ],
    });

    if (!product) {
        throw new Error("Product not found");
    }

    let variant = null;
    if (body.variantId) {
        variant = await variantRepository.findOne({
            where: {
                variantId: body.variantId,
            },
            relations: [
                "variantImages",
                "color",
                "size",
            ],
        });

        if (!variant) {
            throw new Error("Variant not found");
        }
    }

    let existingCartItem = await cartItemRepository.findOne({
        where: {
            cart: {
                cartId: cart.cartId,
            },
            product: {
                productId: product.productId,
            },
            variant: variant
                ? { variantId: variant.variantId }
                : null,
        },
        relations: ["variant"],
    });

    if (existingCartItem) {
        throw new Error("Product already exists in cart");
    }


    const quantity = Number(body.quantity || 1);

    const unitPrice = Number(
        variant ? variant.price : product.base_price
    );

    const totalPrice = quantity * unitPrice;


    const cartItem = cartItemRepository.create({
        cart,
        product,
        variant,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        created_by: userId,
    });

    await cartItemRepository.save(cartItem);

    return await getCart(userId);
}

export const getCart = async (
    userId: number
) => {

    return await cartRepository.findOne({

        where: {
            user_id: userId,
            is_active: true,
        },

        relations: [
            "items",
            "items.product",
            "items.product.category",
            "items.product.media",
            "items.product.gender",
            "items.variant",
            "items.variant.variantImages",
            "items.variant.color",
            "items.variant.size",
        ],
    });
};

export const updateCartItem = async (cartItemId: number, body: any, userId: number) => {
    const cartItem = await cartItemRepository.findOne({
        where: {
            cartItemId
        }
    });

    if (!cartItem) {
        throw new Error("Cart item not found");
    }

    const quantity = Number(body.quantity);

    const totalPrice = quantity * Number(cartItem.unit_price);

    await cartItemRepository.update(cartItemId, {
        quantity,
        total_price: totalPrice,
        updated_by: userId,
    });

    return await cartItemRepository.findOne({
        where: {
            cartItemId,
        },
    });
}

export const removeCartItem = async (cartItemId: number) => {
    await cartItemRepository.delete(cartItemId);

    return true;
};

export const clearCart = async (userId: number) => {
    const cart = await cartRepository.findOne({
        where: {
            user_id: userId,
        },
        relations: ["items"],
    });

    if (!cart) {
        throw new Error("Cart not found");
    }

    await cartItemRepository.delete({
        cart: {
            cartId: cart.cartId,
        },
    });

    return true;
};