// services/returnRequest.service.ts

import { AppDataSource } from "../config/data-source";
import { ReturnStatus, TransactionStatus, TransactionType } from "../constants/enums";
import { OrderItem } from "../entities/OrderItem";
import { ReturnRequest } from "../entities/ReturnRequest";
import { ShopProfile } from "../entities/ShopProfile";
import { Transaction } from "../entities/Transaction";
import { refundTransaction } from "./transaction.service";

export const returnRequestRepository = AppDataSource.getRepository(ReturnRequest);
export const orderItemRepository = AppDataSource.getRepository(OrderItem);
export const shopProfileRepository = AppDataSource.getRepository(ShopProfile);
export const transactionRepository = AppDataSource.getRepository(Transaction);

export const createReturnRequest = async (
    body: any,
    userId: number
) => {

    if (
        !body.returns ||
        !Array.isArray(body.returns) ||
        body.returns.length === 0
    ) {
        throw new Error("Returns array is required");
    }

    const createdRequests = [];

    for (const item of body.returns) {

        if (!item.orderItemId) {
            throw new Error("Order Item ID is required");
        }

        if (!item.reason) {
            throw new Error("Reason is required");
        }

        const orderItem = await orderItemRepository.findOne({
            where: {
                orderItemId: item.orderItemId,
            },
            relations: ["order"],
        });

        if (!orderItem) {
            throw new Error(
                `Order item ${item.orderItemId} not found`
            );
        }

        // Ensure the logged-in user owns the order
        if (orderItem.order.user_id !== userId) {
            throw new Error(
                `You are not allowed to return Order Item ${item.orderItemId}`
            );
        }

        // Prevent duplicate requests
        const existing = await returnRequestRepository.findOne({
            where: {
                orderItem: {
                    orderItemId: item.orderItemId,
                },
            },
            relations: ["orderItem"],
        });

        if (existing) {
            throw new Error(
                `Return request already exists for Order Item ${item.orderItemId}`
            );
        }

        const request = returnRequestRepository.create({
            order: orderItem.order,
            orderItem,
            user_id: userId,
            seller_id: Number(orderItem.seller_id),
            reason: item.reason,
            description: item.description,
            images: item.images,
            amount: orderItem.total_price,
            status: ReturnStatus.REQUESTED,
        });

        const savedRequest = await returnRequestRepository.save(request);

        createdRequests.push(savedRequest);
    }

    return createdRequests;
};

export const getSellerReturnRequest = async (
    sellerId: number,
    status?: string
) => {
    const query = returnRequestRepository
        .createQueryBuilder("rr")
        .leftJoinAndSelect("rr.order", "order")
        .leftJoinAndSelect("rr.orderItem", "orderItem")
        .leftJoinAndSelect("orderItem.product", "product")
        .leftJoinAndSelect("orderItem.variant", "variant")
        .where("rr.seller_id = :sellerId", { sellerId });

    if (status) {
        query.andWhere("rr.status = :status", { status });
    }

    query.orderBy("rr.created_at", "DESC");

    return await query.getMany();
}

export const approveRejectReturnRequest = async (
    body: any,
    sellerId: number
) => {

    const request = await returnRequestRepository.findOne({
        where: {
            returnRequestId: body.returnRequestId,
            seller_id: sellerId,
        },  
    });

    if (!request) {
        throw new Error("Return request not found");
    }

    if (request.status !== ReturnStatus.REQUESTED) {
        throw new Error("Return request already processed");
    }

    if (body.action === "APPROVE") {

        request.status = ReturnStatus.APPROVED;

        await returnRequestRepository.save(request);

        const shop = await shopProfileRepository.findOne({
            where: {
                seller_id: sellerId,
            },
        });

        return {
            message: "Return request approved successfully.",
            request,
            returnAddress: shop,
        };
    }

    if (body.action === "REJECT") {

        request.status = ReturnStatus.REJECTED;
        request.seller_comment = body.seller_comment;

        await returnRequestRepository.save(request);

        return {
            message: "Return request rejected successfully.",
            request,
        };
    }

    throw new Error("Invalid action");
};

export const shipReturnProduct = async (
    body: any,
    userId: number
) => {

    const request = await returnRequestRepository.findOne({
        where: {
            returnRequestId: body.returnRequestId,
            user_id: userId
        }
    });

    if (!request) {
        throw new Error("Return request not found");
    }

    if (request.status !== ReturnStatus.APPROVED) {
        throw new Error("Return request is not approved.");
    }

    request.courier_name = body.courier_name;
    request.tracking_number = body.tracking_number;
    request.status = ReturnStatus.SHIPPED;

    return await returnRequestRepository.save(request);
};

export const receiveReturnProduct = async (
    body: any,
    sellerId: number
) => {

    const request = await returnRequestRepository.findOne({
        where: {
            returnRequestId: body.returnRequestId,
            seller_id: sellerId
        }
    });

    if (!request) {
        throw new Error("Return request not found");
    }

    if (request.status !== ReturnStatus.SHIPPED) {
        throw new Error("Product has not been shipped yet.");
    }

    request.status = ReturnStatus.RECEIVED;

    return await returnRequestRepository.save(request);
};

export const refundReturnRequest = async (
    body: any,
    sellerId: number,
    userId: number
) => {

    const request = await returnRequestRepository.findOne({
        where: {
            returnRequestId: body.returnRequestId,
            seller_id: sellerId,
        },
        relations: [
            "order",
            "orderItem",
        ],
    });

    if (!request) {
        throw new Error("Return request not found.");
    }

    if (request.status !== ReturnStatus.RECEIVED) {
        throw new Error("Product has not been received yet.");
    }

    if (request.refunded_transaction_id) {
        throw new Error("Refund has already been processed.");
    }

    // Original SALE transaction
    const paymentTransaction = await transactionRepository.findOne({
        where: {
            order: {
                orderId: request.order.orderId,
            },
            transaction_type: TransactionType.SALE,
            transaction_status: TransactionStatus.SETTLED,
            is_active: true,
        },
        relations: ["order"],
        order: {
            created_at: "DESC",
        },
    });

    if (!paymentTransaction) {
        throw new Error("Original payment transaction not found.");
    }

    if (!request.amount || Number(request.amount) <= 0) {
        throw new Error("Invalid refund amount.");
    }

    // Prevent refunding more than original payment
    if (Number(request.amount) > Number(paymentTransaction.amount)) {
        throw new Error(
            "Refund amount cannot exceed original payment."
        );
    }

    // Refund from Square + Save refund transaction
    const refundTransactionData = await refundTransaction(
        paymentTransaction.transactionId,
        Number(request.amount),
        userId
    );

    // Update Return Request
    request.status = ReturnStatus.REFUNDED;
    request.refunded_transaction_id =
        refundTransactionData.transactionId;
    request.refunded_at = new Date();
    request.refund_mode = "SQUARE";

    await returnRequestRepository.save(request);

    return {
        message: "Refund processed successfully.",
        refund: refundTransactionData,
        request,
    };
};