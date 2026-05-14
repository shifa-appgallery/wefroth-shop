"use strict";
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
exports.OrderItem = void 0;
const typeorm_1 = require("typeorm");
const Order_1 = require("./Order");
const Product_1 = require("./Product");
const ProductVariant_1 = require("./ProductVariant");
const enums_1 = require("../constants/enums");
let OrderItem = class OrderItem {
};
exports.OrderItem = OrderItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], OrderItem.prototype, "orderItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1.Order, (order) => order.items, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Order_1.Order)
], OrderItem.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product),
    __metadata("design:type", Product_1.Product)
], OrderItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductVariant_1.ProductVariant, {
        nullable: true,
    }),
    __metadata("design:type", ProductVariant_1.ProductVariant)
], OrderItem.prototype, "variant", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: enums_1.SellerType,
    }),
    __metadata("design:type", String)
], OrderItem.prototype, "seller_type", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { nullable: true }),
    __metadata("design:type", String)
], OrderItem.prototype, "seller_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", {
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], OrderItem.prototype, "unit_price", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", {
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], OrderItem.prototype, "total_price", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", {
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], OrderItem.prototype, "commission_amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderItem.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], OrderItem.prototype, "updated_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OrderItem.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], OrderItem.prototype, "updated_at", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, typeorm_1.Entity)("order_items")
], OrderItem);
