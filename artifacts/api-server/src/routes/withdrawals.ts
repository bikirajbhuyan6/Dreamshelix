import { Router } from "express";
import { db } from "@workspace/db";
import { withdrawalsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const withdrawals = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, req.userId!));
    res.json(withdrawals.map((w) => ({ ...w, amount: parseFloat(w.amount) })));
  } catch (error) {
    console.error("List withdrawals error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, method, bankDetails, upiId } = req.body;
    if (!amount || !method) {
      res.status(400).json({ error: "Bad Request", message: "amount and method are required" });
      return;
    }

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
