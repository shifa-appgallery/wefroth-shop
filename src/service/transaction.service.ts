import { AppDataSource } from "../config/data-source";
import { Transaction } from "../entities/Transaction";
import { Order } from "../entities/Order";
import { SellerType, TransactionStatus, TransactionType, } from "../constants/enums";
import {
    createPayment,
    refundPayment,
    getPayment,
} from "./square.service";

const transactionRepository =
    AppDataSource.getRepository(Transaction);

const orderRepository =
    AppDataSource.getRepository(Order);

/**
 * Create Transaction
 */
export const createTransaction = async (
    body: any,
    userId: number
) => {
    let order = null;

    if (body.orderId) {

        order = await orderRepository.findOne({
            where: {
                orderId: body.orderId,
            },
        });

        if (!order) {
            throw new Error("Order not found");
        }
    }

    const transaction = transactionRepository.create({
        seller_type: body.seller_type,
        seller_id: body.seller_id,
        order,
        transaction_type: body.transaction_type,
        transaction_reference:
            body.transaction_reference,
        payment_gateway: body.payment_gateway,
        payment_method: body.payment_method,
        amount: body.amount,
        transaction_status:
            body.transaction_status ??
            TransactionStatus.PENDING,
        gateway_response: body.gateway_response,
        created_by: userId,
    });

    return await transactionRepository.save(
        transaction
    );
};

/**
 * Get Transactions
 */
export const getTransactions = async (
    offset: number = 0,
    limit: number = 10
) => {

    const [data, total] =
        await transactionRepository.findAndCount({
            where: {
                is_active: true,
            },
            relations: {
                order: true,
            },
            order: {
                created_at: "DESC",
            },
            skip: offset,
            take: limit,
        });

    return {
        total,
        offset,
        limit,
        data,
    };
};

/**
 * Get Transaction By Id
 */
export const getTransactionById = async (
    transactionId: number
) => {

    const transaction =
        await transactionRepository.findOne({
            where: {
                transactionId,
                is_active: true,
            },
            relations: {
                order: true,
            },
        });

    if (!transaction) {
        throw new Error(
            "Transaction not found"
        );
    }

    return transaction;
};

export const updateTransaction = async (
    transactionId: number,
    body: any,
    userId: number
) => {

    const transaction = await transactionRepository.findOne({
        where: {
            transactionId,
            is_active: true,
        },
    });

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    let order = transaction.order;

    if (body.orderId) {
        order = await orderRepository.findOne({
            where: {
                orderId: body.orderId,
            },
        });

        if (!order) {
            throw new Error("Order not found");
        }
    }

    await transactionRepository.update(transactionId, {
        seller_type: body.seller_type,
        seller_id: body.seller_id,
        order,
        transaction_type: body.transaction_type,
        transaction_reference: body.transaction_reference,
        payment_gateway: body.payment_gateway,
        payment_method: body.payment_method,
        amount: body.amount,
        transaction_status: body.transaction_status,
        gateway_response: body.gateway_response,
        updated_by: userId,
    });

    return await transactionRepository.findOne({
        where: {
            transactionId,
        },
        relations: {
            order: true,
        },
    });
};

export const deleteTransaction = async (
    transactionId: number,
    userId: number
) => {

    const transaction = await transactionRepository.findOne({
        where: {
            transactionId,
            is_active: true,
        },
    });

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    await transactionRepository.update(transactionId, {
        is_active: false,
        updated_by: userId,
    });

    return {
        message: "Transaction deleted successfully",
    };
};

export const createSquarePayment = async (
    body: any,
    userId: number
) => {
    try {
        const payment = await createPayment(
            body.sourceId,
            body.amount
        );

        const gatewayResponse = JSON.parse(
            JSON.stringify(
                payment,
                (_, value) =>
                    typeof value === "bigint"
                        ? value.toString()
                        : value
            )
        );

        let order = null;

        if (body.orderId) {
            order = await orderRepository.findOne({
                where: {
                    orderId: body.orderId,
                },
            });

            if (!order) {
                throw new Error("Order not found");
            }
        }

        const transaction = transactionRepository.create({
            seller_type: body.seller_type,
            seller_id: body.seller_id,
            order,
            transaction_type: TransactionType.SALE,
            transaction_reference: payment.payment?.id,
            payment_gateway: "SQUARE",
            payment_method:
                payment.payment?.cardDetails?.card?.cardBrand ??
                "CARD",
            amount: body.amount,
            transaction_status: TransactionStatus.SETTLED,
            gateway_response: gatewayResponse,
            created_by: userId,
        });

        return await transactionRepository.save(transaction);
    } catch (error: any) {
        console.error("Square Payment Error:");
        console.dir(error, { depth: null });

        if (error.errors) {
            console.log("Square Errors:", error.errors);
        }

        throw error;
    }
};

export const refundTransaction = async (
    transactionId: number,
    amount: number,
    userId: number
) => {

    const transaction = await transactionRepository.findOne({
        where: {
            transactionId,
            is_active: true,
        },
        relations: ["order"],
    });

    if (!transaction) {
        throw new Error("Transaction not found.");
    }

    if (!transaction.transaction_reference) {
        throw new Error("Payment reference not found.");
    }

    // Total refunded till now
    const previousRefunds = await transactionRepository
        .createQueryBuilder("transaction")
        .select("COALESCE(SUM(transaction.amount),0)", "total")
        .where("transaction.transaction_type = :type", {
            type: TransactionType.REFUND,
        })
        .andWhere(
            "transaction.refunded_transaction_id = :transactionId",
            {
                transactionId: transaction.transactionId,
            }
        )
        .getRawOne();

    const alreadyRefunded =
        Number(previousRefunds.total);

    const originalAmount =
        Number(transaction.amount);

    if (
        alreadyRefunded + amount >
        originalAmount
    ) {
        throw new Error(
            "Refund amount exceeds original payment."
        );
    }

    const refund = await refundPayment(
        transaction.transaction_reference,
        amount
    );

    const gatewayResponse = JSON.parse(
        JSON.stringify(
            refund,
            (_, value) =>
                typeof value === "bigint"
                    ? value.toString()
                    : value
        )
    );

    const refundTransaction =
        transactionRepository.create({

            seller_type: transaction.seller_type,

            seller_id: transaction.seller_id,

            order: transaction.order,

            transaction_type: TransactionType.REFUND,

            refundedTransaction: transaction, 

            transaction_reference:
                refund.refund?.id,

            payment_gateway: transaction.payment_gateway,

            payment_method: transaction.payment_method,

            amount,

            transaction_status:
                TransactionStatus.SETTLED,

            gateway_response: gatewayResponse,

            created_by: userId,
        });

    return await transactionRepository.save(
        refundTransaction
    );
};