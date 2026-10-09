import { z } from "zod";

export const createBloodRequestSchema = z.object({
  body: z.object({
    bloodGroup: z.enum([
      "A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE",
      "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"
    ]),
    unitsNeeded: z.number().int().positive("Units must be at least 1"),
    hospitalName: z.string().min(2, "Hospital name required"),
    hospitalAddress: z.string().min(3, "Hospital address required"),
    contactNumber: z.string().min(6, "Valid contact number required"),
    emergencyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional()
  })
});

export const updateRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "VERIFIED", "ASSIGNED", "COMPLETED", "CANCELLED"])
  })
});
