import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  coursesTable,
  enrollmentsTable,
  paymentsTable,
  withdrawalsTable,
  referralsTable,
  notificationsTable,
} from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { authenticate, requireAdmin, AuthRequest } from "../middlewares/auth.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/stats", async (req: AuthRequest, res) => {
  try {
    const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const [totalCoursesResult] = await db.select({ count: sql<number>`count(*)` }).from(coursesTable);
    const [totalEnrollmentsResult] = await db.select({ count: sql<number>`count(*)` }).from(enrollmentsTable);
    const [totalRevenueResult] = await db.select({
      total: sql<number>`coalesce(sum(cast(amount as decimal)), 0)`,
    }).from(paymentsTable).where(eq(paymentsTable.status, "success"));
    const [pendingWithdrawalsResult] = await db.select({ count: sql<number>`count(*)` }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "pending"));
    const [withdrawalAmountResult] = await db.select({
      total: sql<number>`coalesce(sum(cast(amount as decimal)), 0)`,
    }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "pending"));

    // Monthly data for charts (last 6 months)
    const now = new Date();
    const revenueChart = [];
    const enrollmentChart = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = months[monthDate.getMonth()];

      const [rev] = await db.select({
        total: sql<number>`coalesce(sum(cast(amount as decimal)), 0)`,
      }).from(paymentsTable).where(
        sql`status = 'success' AND created_at >= ${monthDate.toISOString()} AND created_at < ${nextMonth.toISOString()}`
      );

      const [enr] = await db.select({
        count: sql<number>`count(*)`,
      }).from(enrollmentsTable).where(
        sql`enrolled_at >= ${monthDate.toISOString()} AND enrolled_at < ${nextMonth.toISOString()}`
      );

      revenueChart.push({ label, value: parseFloat(String(rev.total || 0)) });
      enrollmentChart.push({ label, value: parseInt(String(enr.count || 0)) });
    }

    // Top courses
    const topCourses = await db.select({
      id: coursesTable.id,
      title: coursesTable.title,
      enrollments: coursesTable.totalStudents,
    }).from(coursesTable).orderBy(desc(coursesTable.totalStudents)).limit(5);

    const newUsersThisMonth = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(
      sql`created_at >= date_trunc('month', now())`
    );

    const revenueThisMonth = await db.select({
      total: sql<number>`coalesce(sum(cast(amount as decimal)), 0)`,
    }).from(paymentsTable).where(
      sql`status = 'success' AND created_at >= date_trunc('month', now())`
    );

    res.json({
      totalUsers: Number(totalUsersResult.count),
      newUsersThisMonth: Number(newUsersThisMonth[0]?.count || 0),
      totalCourses: Number(totalCoursesResult.count),
      totalEnrollments: Number(totalEnrollmentsResult.count),
      totalRevenue: parseFloat(String(totalRevenueResult.total || 0)),
      revenueThisMonth: parseFloat(String(revenueThisMonth[0]?.total || 0)),
      totalWithdrawalsPending: Number(pendingWithdrawalsResult.count),
      totalWithdrawalAmount: parseFloat(String(withdrawalAmountResult.total || 0)),
      revenueChart,
      enrollmentChart,
      topCourses: topCourses.map((c) => ({
        id: c.id,
        title: c.title,
        enrollments: c.enrollments,
        revenue: 0,
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users", async (req: AuthRequest, res) => {
  try {
    const { page = "1", limit = "20", search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    let users;
    let countResult;
    if (search) {
      const { ilike, or } = await import("drizzle-orm");
      users = await db.select().from(usersTable).where(
        or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`))
      ).limit(limitNum).offset(offset);
      countResult = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(
        or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`))
      );
    } else {
      users = await db.select().from(usersTable).limit(limitNum).offset(offset);
      countResult = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    }

    const total = Number(countResult[0]?.count || 0);
    res.json({
      users: users.map((u) => {
        const { passwordHash: _, ...userWithoutPassword } = u;
        return {
          ...userWithoutPassword,
          walletBalance: parseFloat(u.walletBalance || "0"),
          totalEarnings: parseFloat(u.totalEarnings || "0"),
        };
      }),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Admin list users error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users/:userId", async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!users.length) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    const { passwordHash: _, ...user } = users[0];
    res.json({
      ...user,
      walletBalance: parseFloat(user.walletBalance || "0"),
      totalEarnings: parseFloat(user.totalEarnings || "0"),
    });
  } catch (error) {
    console.error("Admin get user error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/users/:userId", async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { name, phone, role, isActive } = req.body;

    const [user] = await db.update(usersTable).set({
      name: name || undefined,
      phone: phone || undefined,
      role: role || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId)).returning();

    if (!user) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      walletBalance: parseFloat(user.walletBalance || "0"),
      totalEarnings: parseFloat(user.totalEarnings || "0"),
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/withdrawals", async (req: AuthRequest, res) => {
  try {
    const withdrawals = await db.select().from(withdrawalsTable).orderBy(desc(withdrawalsTable.createdAt));
    res.json(withdrawals.map((w) => ({ ...w, amount: parseFloat(w.amount) })));
  } catch (error) {
    console.error("Admin list withdrawals error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/withdrawals/:withdrawalId/approve", async (req: AuthRequest, res) => {
  try {
    const withdrawalId = parseInt(req.params.withdrawalId);
    const [withdrawal] = await db.update(withdrawalsTable).set({
      status: "approved",
      processedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(withdrawalsTable.id, withdrawalId)).returning();

    if (!withdrawal) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    await db.insert(notificationsTable).values({
      userId: withdrawal.userId,
      title: "Withdrawal Approved",
      message: `Your withdrawal of ₹${parseFloat(withdrawal.amount)} has been approved and will be processed shortly.`,
      type: "withdrawal",
      isRead: false,
    });

    res.json({ ...withdrawal, amount: parseFloat(withdrawal.amount) });
  } catch (error) {
    console.error("Admin approve withdrawal error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/withdrawals/:withdrawalId/reject", async (req: AuthRequest, res) => {
  try {
    const withdrawalId = parseInt(req.params.withdrawalId);
    const withdrawal = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, withdrawalId)).limit(1);
    
    if (!withdrawal.length) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    // Refund wallet balance
    const user = await db.select().from(usersTable).where(eq(usersTable.id, withdrawal[0].userId)).limit(1);
    if (user.length) {
      await db.update(usersTable).set({
        walletBalance: (parseFloat(user[0].walletBalance || "0") + parseFloat(withdrawal[0].amount)).toString(),
      }).where(eq(usersTable.id, withdrawal[0].userId));
    }

    const [updated] = await db.update(withdrawalsTable).set({
      status: "rejected",
      processedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(withdrawalsTable.id, withdrawalId)).returning();

    await db.insert(notificationsTable).values({
      userId: withdrawal[0].userId,
      title: "Withdrawal Rejected",
      message: `Your withdrawal of ₹${parseFloat(withdrawal[0].amount)} has been rejected. Amount returned to wallet.`,
      type: "withdrawal",
      isRead: false,
    });

    res.json({ ...updated, amount: parseFloat(updated.amount) });
  } catch (error) {
    console.error("Admin reject withdrawal error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/referrals", async (req: AuthRequest, res) => {
  try {
    const referrals = await db.select({
      id: referralsTable.id,
      referrerId: referralsTable.referrerId,
      referredId: referralsTable.referredId,
      level: referralsTable.level,
      commissionAmount: referralsTable.commissionAmount,
      status: referralsTable.status,
      createdAt: referralsTable.createdAt,
    }).from(referralsTable).orderBy(desc(referralsTable.createdAt));

    // Get user names
    const userIds = [...new Set([...referrals.map(r => r.referrerId), ...referrals.map(r => r.referredId)])];
    const users = userIds.length > 0
      ? await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable).where(
          usersTable.id.inArray(userIds)
        )
      : [];

    const userMap = new Map(users.map((u) => [u.id, u.name]));

    res.json(referrals.map((r) => ({
      ...r,
      referrerName: userMap.get(r.referrerId) || "Unknown",
      referredName: userMap.get(r.referredId) || "Unknown",
      commissionAmount: parseFloat(r.commissionAmount || "0"),
    })));
  } catch (error) {
    console.error("Admin list referrals error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
