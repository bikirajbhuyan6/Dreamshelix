import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, withdrawalsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth.js";

const router = Router();

// Payment routes
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.userId, req.userId!));
    res.json(payments.map((p) => ({
      ...p,
      amount: parseFloat(p.amount),
    })));
  } catch (error) {
    console.error("List payments error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { courseId, gateway } = req.body;
    if (!courseId || !gateway) {
      res.status(400).json({ error: "Bad Request", message: "courseId and gateway are required" });
      return;
    }

    const { coursesTable } = await import("@workspace/db");
    const courses = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    if (!courses.length) {
      res.status(404).json({ error: "Not Found", message: "Course not found" });
      return;
    }

    const [payment] = await db.insert(paymentsTable).values({
      userId: req.userId!,
      courseId,
      amount: courses[0].price,
      status: "pending",
      gateway,
    }).returning();

    res.status(201).json({
      ...payment,
      amount: parseFloat(payment.amount),
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:paymentId/verify", authenticate, async (req: AuthRequest, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { transactionId } = req.body;

    const [payment] = await db.update(paymentsTable).set({
      transactionId,
      status: "success",
      updatedAt: new Date(),
    }).where(eq(paymentsTable.id, paymentId)).returning();

    if (!payment) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    await db.insert(notificationsTable).values({
      userId: req.userId!,
      title: "Payment Successful",
      message: `Your payment of ₹${parseFloat(payment.amount)} was successful!`,
      type: "payment",
      isRead: false,
    });

    res.json({ ...payment, amount: parseFloat(payment.amount) });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Withdrawal routes
router.get("/withdrawals", authenticate, async (req: AuthRequest, res) => {
  try {
    const withdrawals = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, req.userId!));
    res.json(withdrawals.map((w) => ({ ...w, amount: parseFloat(w.amount) })));
  } catch (error) {
    console.error("List withdrawals error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/withdrawals", authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, method, bankDetails, upiId } = req.body;
    if (!amount || !method) {
      res.status(400).json({ error: "Bad Request", message: "amount and method are required" });
      return;
    }

    // Check wallet balance
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!users.length) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const walletBalance = parseFloat(users[0].walletBalance || "0");
    if (walletBalance < amount) {
      res.status(400).json({ error: "Bad Request", message: "Insufficient wallet balance" });
      return;
    }

    // Deduct from wallet
    await db.update(usersTable).set({
      walletBalance: (walletBalance - amount).toString(),
    }).where(eq(usersTable.id, req.userId!));

    const [withdrawal] = await db.insert(withdrawalsTable).values({
      userId: req.userId!,
      amount: amount.toString(),
      status: "pending",
      method,
      bankDetails: bankDetails || null,
      upiId: upiId || null,
    }).returning();

    await db.insert(notificationsTable).values({
      userId: req.userId!,
      title: "Withdrawal Requested",
      message: `Your withdrawal request of ₹${amount} has been submitted for review.`,
      type: "withdrawal",
      isRead: false,
    });

    res.status(201).json({ ...withdrawal, amount: parseFloat(withdrawal.amount) });
  } catch (error) {
    console.error("Request withdrawal error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
