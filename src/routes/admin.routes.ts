import { Router } from "express";
import {
  getAllUsers,
  updateUserRole,
  getDashboardStats,
  getAuditLogs,
  verifyEmergencyRequest
} from "../controllers/admin.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.get("/dashboard-stats", getDashboardStats);
router.get("/audit-logs", getAuditLogs);
router.patch("/requests/:id/verify", verifyEmergencyRequest);

export default router;
