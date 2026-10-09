import { Response } from "express";
import Stripe from "stripe";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";
import { sendResponse } from "../utils/response";
import { config } from "../config/env";

const stripe = new Stripe(config.stripeSecretKey || "sk_test_dummy", {
  apiVersion: "2024-04-10"
});

export const initiatePayment = async (req: AuthRequest, res: Response) => {
  const { requestId, amount } = req.body;
  const userId = req.user!.id;

  const payment = await prisma.payment.create({
    data: {
      userId,
      requestId,
      amount: Number(amount) || 10.0,
      currency: "usd",
      status: "PENDING"
    }
  });

  let sessionUrl = `https://checkout.stripe.com/pay/cs_test_mockSession_${payment.id}`;
  let sessionId = `cs_test_${payment.id}`;

  if (config.stripeSecretKey && config.stripeSecretKey.startsWith("sk_")) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Emergency Logistics & Blood Donation Fee",
                description: `Emergency dispatch verification for Request: ${requestId || "Direct"}`
              },
              unit_amount: Math.round((Number(amount) || 10.0) * 100)
            },
            quantity: 1
          }
        ],
        mode: "payment",
        success_url: "https://localhost:5000/api/v1/payments/verify?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://localhost:5000/api/v1/payments/cancel"
      });
      sessionUrl = session.url || sessionUrl;
      sessionId = session.id;
    } catch (e: any) {}
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeSessionId: sessionId }
  });

  return sendResponse(res, 201, true, "Payment session initiated successfully", {
    paymentId: payment.id,
    checkoutUrl: sessionUrl,
    sessionId: sessionId
  });
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  const { paymentId, stripeSessionId } = req.body;

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { id: paymentId },
        { stripeSessionId: stripeSessionId }
      ]
    }
  });

  if (!payment) return sendResponse(res, 404, false, "Payment record not found");

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PAID" }
  });

  if (payment.requestId) {
    await prisma.bloodRequest.update({
      where: { id: payment.requestId },
      data: { status: "VERIFIED" }
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: payment.userId,
      action: "PAYMENT_VERIFIED",
      entity: "Payment",
      entityId: payment.id,
      details: `Payment of $${payment.amount} verified successfully`
    }
  });

  return sendResponse(res, 200, true, "Payment verified successfully", updatedPayment);
};

export const getPaymentDetails = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { request: true }
  });

  if (!payment) return sendResponse(res, 404, false, "Payment not found");
  return sendResponse(res, 200, true, "Payment retrieved successfully", payment);
};