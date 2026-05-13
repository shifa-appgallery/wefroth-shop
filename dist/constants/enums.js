"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = exports.TransactionType = exports.PaymentStatus = exports.OrderStatus = exports.SellerType = void 0;
var SellerType;
(function (SellerType) {
    SellerType["PLATFORM"] = "PLATFORM";
    SellerType["TEAM"] = "TEAM";
    SellerType["BRAND"] = "BRAND";
})(SellerType || (exports.SellerType = SellerType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PAID"] = "PAID";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["SALE"] = "SALE";
    TransactionType["COMMISSION"] = "COMMISSION";
    TransactionType["REFUND"] = "REFUND";
    TransactionType["ADJUSTMENT"] = "ADJUSTMENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["SETTLED"] = "SETTLED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
