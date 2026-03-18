import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, referralsTable, earningsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/my", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user.length) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const u = user[0];
    const referralLink = `${process.env.APP_URL || "https://dreamshelix.in"}/register?ref=${u.referralCode}`;

    const directReferrals = await db.select().from(referralsTable).where(
      and(eq(referralsTable.referrerId, userId), eq(referralsTable.level, "direct"))
    );
    const indirectReferrals = await db.select().from(referralsTable).where(
      and(eq(referralsTable.referrerId, userId), eq(referralsTable.level, "indirect"))
    );

    // Get referred user details
    const referredUserIds = directReferrals.map((r) => r.referredId);
    const referredUsers = referredUserIds.length > 0
      ? await db.select({ id: usersTable.id, name: usersTable.name, createdAt: usersTable.createdAt })
          .from(usersTable)
          .where(usersTable.id.inArray(referredUserIds))
      : [];

    const referredUsersWithLevel = [
      ...referredUsers.map((u) => ({
        id: u.id,
        name: u.name,
        joinedAt: u.createdAt,
        level: "direct" as const,
        commissionEarned: parseFloat(
          directReferrals.find((r) => r.referredId === u.id)?.commissionAmount || "0"
        ),
      })),
    ];

    // Total earnings
    const earnings = await db.select({
      total: sql<number>`sum(cast(${earningsTable.amount} as decimal))`,
    }).from(earningsTable).where(eq(earningsTable.userId, userId));

    const pendingEarnings = await db.select({
      total: sql<number>`sum(cast(${earningsTable.amount} as decimal))`,
    }).from(earningsTable).where(and(eq(earningsTable.userId, userId), eq(earningsTable.status, "pending")));

    res.json({
      referralCode: u.referralCode,
      referralLink,
      totalReferrals: directReferrals.length + indirectReferrals.length,
      directReferrals: directReferrals.length,
      indirectReferrals: indirectReferrals.length,
      totalEarnings: parseFloat(u.totalEarnings || "0"),
      pendingEarnings: parseFloat(String(pendingEarnings[0]?.total || "0")),
      referredUsers: referredUsersWithLevel,
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/earnings", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user.length) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const u = user[0];
    const earningsHistory = await db.select().from(earningsTable).where(eq(earningsTable.userId, userId)).orderBy(earningsTable.createdAt);

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = earningsHistory
      .filter((e) => new Date(e.createdAt) >= firstOfMonth)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const pendingEarnings = earningsHistory
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    res.json({
      walletBalance: parseFloat(u.walletBalance || "0"),
      totalEarnings: parseFloat(u.totalEarnings || "0"),
      thisMonthEarnings,
      pendingEarnings,
      earningsHistory: earningsHistory.map((e) => ({
        id: e.id,
        amount: parseFloat(e.amount),
        type: e.type,
        status: e.status,
        description: e.description,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get earnings error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
