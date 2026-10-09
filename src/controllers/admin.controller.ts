import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";
import { sendResponse } from "../utils/response";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      phone: true,
      isAvailable: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
  return sendResponse(res, 200, true, "All users retrieved successfully", users);
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true }
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: "UPDATE_USER_ROLE",
      entity: "User",
      entityId: id,
      details: `Changed role to ${role}`
    }
  });

  return sendResponse(res, 200, true, "User role updated successfully", updated);
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const [totalUsers, totalDonors, totalRequests, completedDonations, totalRevenue] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "DONOR", deletedAt: null } }),
    prisma.bloodRequest.count({ where: { deletedAt: null } }),
    prisma.bloodRequest.count({ where: { status: "COMPLETED" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" }
    })
  ]);

  return sendResponse(res, 200, true, "Dashboard analytics fetched successfully", {
    totalUsers,
    totalDonors,
    totalRequests,
    completedDonations,
    totalRevenue: totalRevenue._sum.amount || 0
  });
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  const logs = await prisma.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  return sendResponse(res, 200, true, "Audit logs retrieved successfully", logs);
};

export const verifyEmergencyRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const verifiedRequest = await prisma.bloodRequest.update({
    where: { id },
    data: { status: "VERIFIED" }
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: "ADMIN_VERIFY_REQUEST",
      entity: "BloodRequest",
      entityId: id,
      details: "Admin manually verified emergency blood request"
    }
  });

  return sendResponse(res, 200, true, "Request marked as verified by Admin", verifiedRequest);
};
