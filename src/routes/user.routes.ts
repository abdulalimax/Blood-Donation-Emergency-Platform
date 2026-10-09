import { Router } from "express";
import { getProfile, updateProfile, findCompatibleDonors } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);
router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.get("/compatible-donors", findCompatibleDonors);

export default router;
