import { Router } from "express";
import categoryRoutes from "./categoryRoute";
import variantRoutes from "./variantRoute";
import productRoutes from "./productRoute";
import shopProfileRoutes from "./shopProfileRoute";
import cartRoutes from "./cartRoute";
import couponRoutes from "./couponRoute";
import orderRoutes from "./orderRoute";
import shippingAddressRoutes from "./shippingAddressRoute";

const router = Router();

router.use("/category", categoryRoutes);
router.use("/variant", variantRoutes);
router.use("/product", productRoutes);
router.use("/shopProfile", shopProfileRoutes);
router.use("/cart", cartRoutes);
router.use("/coupon", couponRoutes);
router.use("/order", orderRoutes);
router.use("/address", shippingAddressRoutes);

export default router;