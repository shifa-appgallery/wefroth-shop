import { AppDataSource } from "../config/data-source";

import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Product";
import { ProductVariant } from "../entities/ProductVariant";
import { Coupon } from "../entities/Coupon";
import { ShippingAddress } from "../entities/ShippingAddress";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItems";
import { OrderStatus } from "../constants/enums";

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
            seller_type: product.seller_type,
            seller_id: userId,
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

export const getOrders = async (
    userId: number,
    orderId?: number
) => {

    const where: any = {
        user_id: userId,
        is_active: true,
    };

    if (orderId) {
        where.orderId = orderId;
    }

    return await orderRepository.find({
        where,
        relations: [
            "items",
            "transactions",
            "cart",
            "items.product",
            "items.variant",
            "items.variant.variantImages"
        ],
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
        relations: [
            "items",
            "transactions",
            "cart",
            "items.product",
            "items.variant",
            "items.variant.variantImages"
        ],
    });
};

export const updateOrderStatus = async (
    orderId: number,
    body: any,
    userId: number
) => {
    const updateData: any = {
        order_status: body.order_status,
        payment_status: body.payment_status,
        updated_by: userId,
    };

    if (body.order_status === OrderStatus.DELIVERED) {
        updateData.delivered_on = new Date();
    }

    await orderRepository.update(orderId, updateData);

    return await getOrderById(orderId);
};

export const getOrderDetails = async (
    userId: number,
    orderId: number
) => {
    const order = await orderRepository.findOne({
        where: {
            orderId,
            user_id: userId,
            is_active: true,
        },
        relations: [
            "shipping_address",
            "coupon",
            "transactions",
            "items",
            "items.product",
            "items.product.shopProfile",
            "items.product.media",
            "items.variant",
            "items.variant.color",
            "items.variant.size",
            "items.variant.variantImages",
        ],
    });

    if (!order) {
        throw new Error("Order not found");
    }

    const latestTransaction =
        order.transactions?.length > 0
            ? [...order.transactions].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            )[0]
            : null;

    return {
        orderId: order.orderId,
        orderNumber: order.order_number,

        orderStatus: order.order_status,
        paymentStatus: order.payment_status,

        paymentMethod: order.payment_method,

        orderDate: order.created_at,
        deliveredOn: order.delivered_on,

        notes: order.notes,

        shippingAddress: order.shipping_address
            ? {
                shippingAddressId:
                    order.shipping_address.shippingAddressId,
                fullName:
                    order.shipping_address.full_name,
                mobileNumber:
                    order.shipping_address.mobile_number,
                email:
                    order.shipping_address.emailId,
                addressLine1:
                    order.shipping_address.address_line_1,
                addressLine2:
                    order.shipping_address.address_line_2,
                city:
                    order.shipping_address.city,
                state:
                    order.shipping_address.state,
                country:
                    order.shipping_address.country,
                postalCode:
                    order.shipping_address.postal_code,
            }
            : null,

        payment: latestTransaction
            ? {
                transactionId:
                    latestTransaction.transactionId,
                transactionReference:
                    latestTransaction.transaction_reference,
                paymentGateway:
                    latestTransaction.payment_gateway,
                paymentMethod:
                    latestTransaction.payment_method,
                transactionStatus:
                    latestTransaction.transaction_status,
                amount: latestTransaction.amount,
                transactionDate:
                    latestTransaction.created_at,
            }
            : null,

        transactions: order.transactions.map(
            (transaction) => ({
                transactionId:
                    transaction.transactionId,
                transactionType:
                    transaction.transaction_type,
                transactionReference:
                    transaction.transaction_reference,
                paymentGateway:
                    transaction.payment_gateway,
                paymentMethod:
                    transaction.payment_method,
                amount: transaction.amount,
                status:
                    transaction.transaction_status,
                createdAt:
                    transaction.created_at,
            })
        ),

        products: order.items.map((item) => {
            const thumbnail =
                item.product?.media?.find(
                    (media) => media.is_thumbnail
                );

            return {
                orderItemId: item.orderItemId,

                quantity: item.quantity,

                unitPrice: item.unit_price,

                totalPrice: item.total_price,

                sellerType: item.seller_type,

                sellerId: item.seller_id,

                product: item.product
                    ? {
                        productId:
                            item.product.productId,

                        productName:
                            item.product.productName,

                        description:
                            item.product.description,

                        basePrice:
                            item.product.base_price,

                        discountedPrice:
                            item.product.discounted_price,

                        currency:
                            item.product.currency,

                        thumbnail:
                            thumbnail?.media_url || null,

                        media:
                            item.product.media?.map(
                                (media) => ({
                                    mediaId:
                                        media.mediaId,
                                    mediaUrl:
                                        media.media_url,
                                    mediaType:
                                        media.media_type,
                                    isThumbnail:
                                        media.is_thumbnail,
                                })
                            ) || [],

                        shop:
                            item.product.shopProfile
                                ? {
                                    shopProfileId:
                                        item.product
                                            .shopProfile
                                            .shopProfileId,

                                    displayName:
                                        item.product
                                            .shopProfile
                                            .display_name,

                                    logo:
                                        item.product
                                            .shopProfile
                                            .logo_url,

                                    banner:
                                        item.product
                                            .shopProfile
                                            .banner_url,
                                }
                                : null,
                    }
                    : null,

                variant: item.variant
                    ? {
                        variantId:
                            item.variant.variantId,

                        name:
                            item.variant.name,

                        sku:
                            item.variant.sku,

                        price:
                            item.variant.price,

                        discountedPrice:
                            item.variant
                                .discounted_price,

                        stock:
                            item.variant.stock,

                        color:
                            item.variant.color
                                ? {
                                    colorId:
                                        item.variant.color
                                            .colorId,
                                    colorName:
                                        item.variant.color
                                            .name,
                                }
                                : null,

                        size:
                            item.variant.size
                                ? {
                                    sizeId:
                                        item.variant.size
                                            .sizeId,
                                    sizeName:
                                        item.variant.size
                                            .name,
                                }
                                : null,

                        images:
                            item.variant.variantImages?.map(
                                (image) => ({
                                    imageId:
                                        image.variantImageId,
                                    imageUrl:
                                        image.image_url,
                                })
                            ) || [],
                    }
                    : null,
            };
        }),

        orderSummary: {
            subtotal: order.subtotal,

            discountAmount:
                order.discount_amount,

            shippingAmount:
                order.shipping_amount,

            taxAmount:
                order.tax_amount,

            totalAmount:
                order.total_amount,
        },

        coupon: order.coupon
            ? {
                couponId:
                    order.coupon.couponId,
                couponCode:
                    order.coupon.code,
            }
            : null,
    };
};

export const getOrderList = async (
    userId: number,
    offset: number = 0,
    limit: number = 10,
    status?: string
) => {
    const queryBuilder = orderRepository
        .createQueryBuilder("order")
        .leftJoinAndSelect(
            "order.shipping_address",
            "shipping_address"
        )
        .leftJoinAndSelect("order.items", "items")
        .leftJoinAndSelect("items.product", "product")
        .leftJoinAndSelect("product.media", "media")
        .where("order.user_id = :userId", {
            userId,
        })
        .andWhere("order.is_active = true");

    if (status) {
        queryBuilder.andWhere(
            "order.order_status = :status",
            { status }
        );
    }

    const [orders, totalRecords] =
        await queryBuilder
            .orderBy("order.created_at", "DESC")
            .skip(offset)
            .take(limit)
            .getManyAndCount();

    return {
        totalCount: totalRecords,
        offset,
        limit,
        data: orders.map((order) => {
            const thumbnail = order.items?.[0]?.product?.media?.find(
                (m) => m.is_thumbnail
            );

            return {
                orderId: order.orderId,
                orderNumber: order.order_number,
                customerName:
                    order.shipping_address?.full_name || "",
                totalAmount: Number(order.total_amount),
                orderDate: order.created_at,
                orderStatus: order.order_status,
                paymentStatus: order.payment_status,
                productCount: order.items?.length || 0,
                thumbnail: thumbnail?.media_url || null,
            };
        }),
    };
};