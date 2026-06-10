import { AppDataSource } from "../config/data-source";

import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";
import { Coupon } from "../entities/Coupon";
import { ShippingAddress } from "../entities/ShippingAddress";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItems";

const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const productRepository = AppDataSource.getRepository(Product);
const variantRepository = AppDataSource.getRepository(ProductVariant);
const couponRepository = AppDataSource.getRepository(Coupon);
const shippingRepository = AppDataSource.getRepository(ShippingAddress);
const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);

export const createOrder = async (
    body: any,
    userId: number
) => {
    const cart = await cartRepository.findOne({
        where: {
            cartId: body.cartId,
            user_id: userId,
            is_active: true,
        },
        relations: [
            "items",
            "items.product",
            "items.variant",
        ],
    });

    if (!cart) {
        throw new Error("Cart not found");
    }

    if (!cart.items?.length) {
        throw new Error("Cart is empty");
    }

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const cartItem of cart.items) {
        const product = cartItem.product;

        if (!product || !product.is_active) {
            throw new Error(
                `Product unavailable: ${product?.productName || "Unknown"}`
            );
        }

        const variant = cartItem.variant || null;

        const unitPrice = Number(
            variant?.price ?? product.base_price
        );

        const quantity = Number(cartItem.quantity);

        const totalPrice = unitPrice * quantity;

        subtotal += totalPrice;

        orderItems.push({
            product,
            variant,
            quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            created_by: userId,
        });
    }

    let coupon = null;
    let discountAmount = 0;

    if (body.couponId) {
        coupon = await couponRepository.findOne({
            where: {
                couponId: body.couponId,
            },
        });

        if (coupon) {
            discountAmount =
                (subtotal *
                    Number(coupon.discount_percentage || 0)) /
                100;
        }
    }

    const shippingAddress =
        await shippingRepository.findOne({
            where: {
                shippingAddressId:
                    body.shippingAddressId,
            },
        });

    if (!shippingAddress) {
        throw new Error(
            "Shipping address not found"
        );
    }

    const shippingAmount = Number(
        body.shipping_amount || 0
    );

    const taxAmount = Number(
        body.tax_amount || 0
    );

    const totalAmount =
        subtotal -
        discountAmount +
        shippingAmount +
        taxAmount;

    const order = orderRepository.create({
        user_id: userId,
        order_number: `ORD-${Date.now()}`,
        shipping_address: shippingAddress,
        coupon,
        cart,
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_method: body.payment_method,
        notes: body.notes,
        created_by: userId,
    });

    const savedOrder =
        await orderRepository.save(order);

    // Save Order Items

    await orderItemRepository.save(
        orderItems.map((item) => ({
            ...item,
            order: savedOrder,
        }))
    );
    // Clear Cart
    await cartItemRepository.delete({
        cart: {
            cartId: cart.cartId,
        },
    });

    return await getOrderById(savedOrder.orderId);

};

export const getOrders = async (userId: number) => {
    return await orderRepository.find({
        where: {
            user_id: userId,
            is_active: true,
        },
        relations: ["items", "transactions", "cart", "items.product", "items.variant"],
        order: {
            created_at: "DESC",
        },
    });
};

export const getOrderById = async (orderId: number) => {
    return await orderRepository.findOne({
        where: {
            orderId,
        },
        relations: ["items", "transactions"],
    });
};

export const updateOrderStatus = async (
    orderId: number,
    body: any,
    userId: number
) => {
    await orderRepository.update(orderId, {
        order_status: body.order_status,
        payment_status: body.payment_status,
        updated_by: userId,
    });

    return await getOrderById(orderId);
};