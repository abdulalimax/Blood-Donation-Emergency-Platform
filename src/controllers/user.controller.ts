import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";
import { sendResponse } from "../utils/response";

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      phone: true,
      isAvailable: true,
      lastDonationDate: true,
      createdAt: true
    }
  });

  if (!user) return sendResponse(res, 404, false, "User not found");
  return sendResponse(res, 200, true, "Profile retrieved successfully", user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, phone, city, isAvailable, bloodGroup, lastDonationDate } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: req.user?.id },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(city && { city }),
      ...(typeof isAvailable === "boolean" && { isAvailable }),
      ...(bloodGroup && { bloodGroup }),
      ...(lastDonationDate && { lastDonationDate: new Date(lastDonationDate) })
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      phone: true,
      isAvailable: true,
      lastDonationDate: true
    }
  });

  return sendResponse(res, 200, true, "Profile updated successfully", updatedUser);
};

export const findCompatibleDonors = async (req: AuthRequest, res: Response) => {
  const { bloodGroup, city } = req.query;

  const compatibilityMap: Record<string, string[]> = {
    A_POSITIVE: ["A_POSITIVE", "A_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
    A_NEGATIVE: ["A_NEGATIVE", "O_NEGATIVE"],
    B_POSITIVE: ["B_POSITIVE", "B_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
    B_NEGATIVE: ["B_NEGATIVE", "O_NEGATIVE"],
    AB_POSITIVE: [
      "A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE",
      "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"
    ],
    AB_NEGATIVE: ["AB_NEGATIVE", "A_NEGATIVE", "B_NEGATIVE", "O_NEGATIVE"],
    O_POSITIVE: ["O_POSITIVE", "O_NEGATIVE"],
    O_NEGATIVE: ["O_NEGATIVE"]
  };

  const targetGroup = bloodGroup as string;
  const compatibleGroups = targetGroup && compatibilityMap[targetGroup] ? compatibilityMap[targetGroup] : undefined;

  const donors = await prisma.user.findMany({
    where: {
      role: "DONOR",
      deletedAt: null,
      isAvailable: true,
      ...(compatibleGroups && { bloodGroup: { in: compatibleGroups as any } }),
      ...(city && { city: { contains: String(city), mode: "insensitive" } })
    },
    select: {
      id: true,
      name: true,
      email: true,
      bloodGroup: true,
      city: true,
      phone: true,
      lastDonationDate: true
    }
  });

  return sendResponse(res, 200, true, "Compatible donors fetched successfully", donors);
};
