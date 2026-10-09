import { Router } from "express";
import { initiatePayment, verifyPayment, getPaymentDetails } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);
router.get("/:id", getPaymentDetails);

export default router;
