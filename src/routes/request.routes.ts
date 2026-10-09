import { Router } from "express";
import {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  acceptBloodRequest,
  completeBloodRequest,
  cancelBloodRequest,
  getMyRequests,
  getMyDonations
} from "../controllers/request.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createBloodRequestSchema } from "../validations/request.validation";

const router = Router();
router.use(authenticate);

router.post("/", authorize("RECIPIENT", "ADMIN"), validate(createBloodRequestSchema), createBloodRequest);
router.get("/", getBloodRequests);
router.get("/my-requests", authorize("RECIPIENT", "ADMIN"), getMyRequests);
router.get("/my-donations", authorize("DONOR", "ADMIN"), getMyDonations);
router.get("/:id", getBloodRequestById);
router.patch("/:id", updateBloodRequest);
router.delete("/:id", deleteBloodRequest);

router.post("/:id/accept", authorize("DONOR", "ADMIN"), acceptBloodRequest);
router.patch("/:id/complete", completeBloodRequest);
router.post("/:id/cancel", cancelBloodRequest);

export default router;
