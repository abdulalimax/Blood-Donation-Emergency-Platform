import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";
import { sendResponse } from "../utils/response";
import { RequestStatus } from "@prisma/client";

export const createBloodRequest = async (req: AuthRequest, res: Response) => {
  const { bloodGroup, unitsNeeded, hospitalName, hospitalAddress, contactNumber, emergencyLevel } = req.body;
  const newRequest = await prisma.bloodRequest.create({
    data: {
      recipientId: req.user!.id,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      hospitalAddress,
      contactNumber,
      emergencyLevel: emergencyLevel || "CRITICAL"
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: "CREATE_BLOOD_REQUEST",
      entity: "BloodRequest",
      entityId: newRequest.id,
      details: `Blood request created for ${unitsNeeded} unit(s) of ${bloodGroup}`
    }
  });

  return sendResponse(res, 201, true, "Blood request submitted successfully", newRequest);
};

export const getBloodRequests = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as RequestStatus;
  const bloodGroup = req.query.bloodGroup as any;
  const search = req.query.search as string;

  const where: any = { deletedAt: null };
  if (status) where.status = status;
  if (bloodGroup) where.bloodGroup = bloodGroup;
  if (search) {
    where.OR = [
      { hospitalName: { contains: search, mode: "insensitive" } },
      { hospitalAddress: { contains: search, mode: "insensitive" } }
    ];
  }

  const [total, requests] = await Promise.all([
    prisma.bloodRequest.count({ where }),
    prisma.bloodRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        recipient: { select: { id: true, name: true, phone: true } },
        donor: { select: { id: true, name: true, phone: true } }
      }
    })
  ]);

  return sendResponse(res, 200, true, "Blood requests retrieved successfully", {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: requests
  });
};

export const getBloodRequestById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const request = await prisma.bloodRequest.findFirst({
    where: { id, deletedAt: null },
    include: {
      recipient: { select: { id: true, name: true, phone: true, email: true } },
      donor: { select: { id: true, name: true, phone: true, email: true } }
    }
  });

  if (!request) return sendResponse(res, 404, false, "Blood request not found");
  return sendResponse(res, 200, true, "Blood request fetched successfully", request);
};

export const updateBloodRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const request = await prisma.bloodRequest.findFirst({ where: { id, deletedAt: null } });

  if (!request) return sendResponse(res, 404, false, "Blood request not found");
  if (req.user?.role !== "ADMIN" && request.recipientId !== req.user?.id) {
    return sendResponse(res, 403, false, "You are not authorized to update this request");
  }

  const updated = await prisma.bloodRequest.update({
    where: { id },
    data: req.body
  });

  return sendResponse(res, 200, true, "Blood request updated successfully", updated);
};

export const deleteBloodRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const request = await prisma.bloodRequest.findFirst({ where: { id, deletedAt: null } });

  if (!request) return sendResponse(res, 404, false, "Blood request not found");
  if (req.user?.role !== "ADMIN" && request.recipientId !== req.user?.id) {
    return sendResponse(res, 403, false, "You are not authorized to delete this request");
  }

  await prisma.bloodRequest.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: "SOFT_DELETE_BLOOD_REQUEST",
      entity: "BloodRequest",
      entityId: id,
      details: "Blood request soft deleted"
    }
  });

  return sendResponse(res, 200, true, "Blood request deleted successfully");
};

export const acceptBloodRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const donorId = req.user!.id;

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.bloodRequest.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error("Blood request not found");
    }
    if (existing.status !== "PENDING" && existing.status !== "VERIFIED") {
      throw new Error("This request is no longer open for donation");
    }
    if (existing.donorId) {
      throw new Error("Another donor has already accepted this request");
    }

    const updated = await tx.bloodRequest.update({
      where: { id },
      data: {
        donorId,
        status: "ASSIGNED"
      }
    });

    await tx.user.update({
      where: { id: donorId },
      data: { isAvailable: false }
    });

    await tx.auditLog.create({
      data: {
        userId: donorId,
        action: "DONOR_ACCEPTED_REQUEST",
        entity: "BloodRequest",
        entityId: id,
        details: `Donor accepted emergency request ${id}`
      }
    });

    return updated;
  });

  return sendResponse(res, 200, true, "You have accepted this blood donation request", result);
};

export const completeBloodRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const updated = await prisma.$transaction(async (tx) => {
    const request = await tx.bloodRequest.findUnique({ where: { id } });
    if (!request) throw new Error("Request not found");

    const finished = await tx.bloodRequest.update({
      where: { id },
      data: { status: "COMPLETED" }
    });

    if (request.donorId) {
      await tx.user.update({
        where: { id: request.donorId },
        data: {
          isAvailable: true,
          lastDonationDate: new Date()
        }
      });
    }

    await tx.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "REQUEST_COMPLETED",
        entity: "BloodRequest",
        entityId: id,
        details: "Blood donation cycle successfully completed"
      }
    });

    return finished;
  });

  return sendResponse(res, 200, true, "Donation marked as completed successfully", updated);
};

export const cancelBloodRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const request = await prisma.bloodRequest.findUnique({ where: { id } });
  if (!request) return sendResponse(res, 404, false, "Request not found");

  if (req.user?.role !== "ADMIN" && request.recipientId !== req.user?.id) {
    return sendResponse(res, 403, false, "Unauthorized to cancel this request");
  }

  const cancelled = await prisma.$transaction(async (tx) => {
    const resReq = await tx.bloodRequest.update({
      where: { id },
      data: { status: "CANCELLED" }
    });
    if (request.donorId) {
      await tx.user.update({
        where: { id: request.donorId },
        data: { isAvailable: true }
      });
    }
    return resReq;
  });

  return sendResponse(res, 200, true, "Blood request cancelled successfully", cancelled);
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
  const requests = await prisma.bloodRequest.findMany({
    where: { recipientId: req.user!.id, deletedAt: null },
    orderBy: { createdAt: "desc" }
  });
  return sendResponse(res, 200, true, "My blood requests fetched", requests);
};

export const getMyDonations = async (req: AuthRequest, res: Response) => {
  const donations = await prisma.bloodRequest.findMany({
    where: { donorId: req.user!.id, deletedAt: null },
    orderBy: { createdAt: "desc" }
  });
  return sendResponse(res, 200, true, "My accepted donations fetched", donations);
};