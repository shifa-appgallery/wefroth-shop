import { AppDataSource } from "../config/data-source";

import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";
import { Coupon } from "../entities/Coupon";
import { ShippingAddress } from "../entities/ShippingAddress";

const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const productRepository = AppDataSource.getRepository(Product);
const variantRepository = AppDataSource.getRepository(ProductVariant);
const couponRepository = AppDataSource.getRepository(Coupon);
const shippingRepository = AppDataSource.getRepository(ShippingAddress);

export const createOrder = async (
    body: any,
    userId: number
) => {
    let subtotal = 0;

    const orderItems: any[] = [];

    for (const item of body.items) {
        const product = await productRepository.findOne({
            where: {
                productId: item.productId,
            },
        });

        if (!product) {
            throw new Error("Product not found");
        }
        let variant = null;

        if (item.variantId) {
            variant = await variantRepository.findOne({
                where: {
                    variantId: item.variantId,
                },
            });
        }

        const unitPrice = Number(
            variant ? variant.price : product.base_price
        );

        const totalPrice = unitPrice * Number(item.quantity);

        subtotal += totalPrice;

        orderItems.push({
            product,
            variant,
            seller_type: item.seller_type,
            seller_id: item.seller_id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            commission_amount: item.commission_amount || 0,
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
            discountAmount = Number(coupon.discount_value);
        }
    }

    const shippingAddress = await shippingRepository.findOne({
        where: {
            shippingAddressId: body.shippingAddressId,
        },
    });

    const shippingAmount = Number(body.shipping_amount || 0);
    const taxAmount = Number(body.tax_amount || 0);

    const totalAmount =
        subtotal - discountAmount + shippingAmount + taxAmount;
    const order = orderRepository.create({
        user_id: String(userId),
        order_number: `ORD-${Date.now()}`,
        shipping_address: shippingAddress || null,
        coupon,
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_method: body.payment_method,
        notes: body.notes,
        created_by: userId,
    });

    const savedOrder = await orderRepository.save(order);

    for (const item of orderItems) {
        const orderItem = orderItemRepository.create({
            ...item,
            order: savedOrder,
        });

        await orderItemRepository.save(orderItem);
    }

    return await getOrderById(savedOrder.orderId);
};

export const getOrders = async (userId: number) => {
    return await orderRepository.find({
        where: {
            user_id: String(userId),
            is_active: true,
        },
        relations: ["items", "transactions"],
        order: {
            created_at: "DESC",
        },
    });
};

export const getOrderById = async (orderId: string) => {
    return await orderRepository.findOne({
        where: {
            orderId,
        },
        relations: ["items", "transactions"],
    });
};

export const updateOrderStatus = async (
    orderId: string,
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