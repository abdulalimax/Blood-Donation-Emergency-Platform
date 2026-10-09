import { Router } from "express";
import { register, login, gcpLogin } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, gcpLoginSchema } from "../validations/auth.validation";

const router = Router();
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/gcp-login", validate(gcpLoginSchema), gcpLogin);

export default router;
