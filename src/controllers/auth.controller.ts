import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../utils/prisma";
import { config } from "../config/env";
import { sendResponse } from "../utils/response";

const googleClient = new OAuth2Client(config.googleClientId);

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, bloodGroup, city, phone } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return sendResponse(res, 400, false, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "RECIPIENT",
      bloodGroup,
      city,
      phone
    },
    select: { id: true, name: true, email: true, role: true, bloodGroup: true, city: true, phone: true }
  });

  return sendResponse(res, 201, true, "User registered successfully", user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  if (!user || !user.password) {
    return sendResponse(res, 401, false, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendResponse(res, 401, false, "Invalid email or password");
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });

  return sendResponse(res, 200, true, "Login successful", {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

export const gcpLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  let payload: any;

  try {
    if (config.googleClientId) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: config.googleClientId
      });
      payload = ticket.getPayload();
    } else {
      payload = { email: "demo_gcp_user@example.com", name: "Google Demo User", sub: "mock-google-id-12345" };
    }
  } catch (err) {
    return sendResponse(res, 401, false, "Failed to authenticate with GCP Social Login");
  }

  if (!payload || !payload.email) {
    return sendResponse(res, 400, false, "Google token does not contain a valid email");
  }

  let user = await prisma.user.findFirst({
    where: { OR: [{ email: payload.email }, { googleId: payload.sub }] }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: payload.name || "Google User",
        email: payload.email,
        googleId: payload.sub,
        role: "RECIPIENT"
      }
    });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });

  return sendResponse(res, 200, true, "Google login successful", {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};
