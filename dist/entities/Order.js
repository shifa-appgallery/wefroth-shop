"use strict";
// entities/Order.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const OrderItem_1 = require("./OrderItem");
const ShippingAddress_1 = require("./ShippingAddress");
const Coupon_1 = require("./Coupon");
const Transaction_1 = require("./Transaction");
const enums_1 = require("../constants/enums");
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Order.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)("int"),
    __metadata("design:type", String)
], Order.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "order_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: enums_1.OrderStatus,
        default: enums_1.OrderStatus.PENDING,
    }),
    __metadata("design:type", String)
], Order.prototype, "order_status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: enums_1.PaymentStatus,
        default: enums_1.PaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Order.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ShippingAddress_1.ShippingAddress, {
        nullable: true,
        eager: true,
    }),
    __metadata("design:type", ShippingAddress_1.ShippingAddress)
], Order.prototype, "shipping_address", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Coupon_1.Coupon, {
        nullable: true,
        eager: true,
    }),
    __metadata("design:type", Coupon_1.Coupon)
], Order.prototype, "coupon", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", {
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Order.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", {
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Order.prototype, "discount_amount", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", {
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Order.prototype, "shipping_amount", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", {
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Order.prototype, "tax_amount", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", {
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Order.prototype, "total_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderItem_1.OrderItem, (item) => item.order, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, (transaction) => transaction.order),
    __metadata("design:type", Array)
], Order.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Order.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Order.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "updated_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "updated_at", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)("orders")
], Order);
