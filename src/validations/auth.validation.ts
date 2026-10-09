import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["DONOR", "RECIPIENT"]).optional(),
    bloodGroup: z.enum([
      "A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE",
      "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"
    ]).optional(),
    city: z.string().optional(),
    phone: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
});

export const gcpLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, "Google ID token is required")
  })
});
