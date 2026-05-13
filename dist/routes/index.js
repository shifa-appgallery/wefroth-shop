"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryRoute_1 = __importDefault(require("./categoryRoute"));
const variantRoute_1 = __importDefault(require("./variantRoute"));
const productRoute_1 = __importDefault(require("./productRoute"));
const router = (0, express_1.Router)();
router.use("/category", categoryRoute_1.default);
router.use("/variant", variantRoute_1.default);
router.use("/product", productRoute_1.default);
exports.default = router;
