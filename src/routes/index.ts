import { Router } from "express";
import categoryRoutes from "./categoryRoute";
import variantRoutes from "./variantRoute";
import productRoutes from "./productRoute";
import shopProfileRoutes from "./shopProfileRoute";
import cartRoutes from "./cartRoute";
import couponRoutes from "./couponRoute";
import orderRoutes from "./orderRoute";
import shippingAddressRoutes from "./shippingAddressRoute";
import productMediaRoutes from "./producMediaRoute";
import productReviewRoutes from "./productReviewRoute"
import variantImageRoutes from "./variantImageRoute"
import colorRoutes from "./colorRoute"
import sizeRoutes from "./sizeRoute"
import genderRoutes from "./genderRoute"
import wishlistRoutes from "./wishlistRoutes"

const router = Router();

router.use("/category", categoryRoutes);
router.use("/variant", variantRoutes);
router.use("/product", productRoutes);
router.use("/shopProfile", shopProfileRoutes);
router.use("/cart", cartRoutes);
router.use("/coupon", couponRoutes);
router.use("/order", orderRoutes);
router.use("/address", shippingAddressRoutes);
router.use("/media", productMediaRoutes);
router.use("/review", productReviewRoutes);
router.use("/image", variantImageRoutes);
router.use("/color", colorRoutes);
router.use("/size", sizeRoutes);
router.use("/gender", genderRoutes);
router.use("/wishlist", wishlistRoutes);

export default router;