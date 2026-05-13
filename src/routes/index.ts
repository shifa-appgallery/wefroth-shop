import { Router } from "express";
import categoryRoutes from "./categoryRoute";
import variantRoutes from "./variantRoute";
import productRoutes from "./productRoute";
import shopProfileRoutes from "./shopProfileRoute";



const router = Router();

router.use("/category", categoryRoutes);
router.use("/variant", variantRoutes);
router.use("/product", productRoutes);
router.use("/shopProfile", shopProfileRoutes);

export default router;