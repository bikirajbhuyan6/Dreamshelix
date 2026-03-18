import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, generateToken, AuthRequest } from "../middlewares/auth.js";
import { nanoid } from "nanoid";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Bad Request", message: "Name, email and password are required" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Bad Request", message: "Email already registered" });
      return;
    }

    let referredById: number | null = null;
    let referrer: typeof usersTable.$inferSelect | null = null;
    if (referralCode) {
      const ref = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
      if (ref.length > 0) {
        referredById = ref[0].id;
        referrer = ref[0];
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userReferralCode = nanoid(8).toUpperCase();

    const [user] = await db.insert(usersTable).values({
      name,
      email,
      phone: phone || null,
      passwordHash,
      role: "student",
      referralCode: userReferralCode,
      referredById: referredById || undefined,
      walletBalance: "0",
      totalEarnings: "0",
      isActive: true,
    }).returning();

    // Create referral records if referred
    if (referredById && referrer) {
      const { referralsTable, earningsTable } = await import("@workspace/db");
      
      // Direct referral (20% commission)
      await db.insert(referralsTable).values({
        referrerId: referredById,
        referredId: user.id,
        level: "direct",
        commissionAmount: "0",
        status: "pending",
      });

      // Check if the referrer was also referred (indirect - 10%)
      if (referrer.referredById) {
        await db.insert(referralsTable).values({
          referrerId: referrer.referredById,
          referredId: user.id,
          level: "indirect",
          commissionAmount: "0",
          status: "pending",
        });
      }

      // Create notification for referrer
      const { notificationsTable } = await import("@workspace/db");
      await db.insert(notificationsTable).values({
        userId: referredById,
        title: "New Referral",
        message: `${name} joined using your referral link!`,
        type: "referral",
        isRead: false,
      });
    }

    const token = generateToken(user.id, user.role);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: {
        ...userWithoutPassword,
        walletBalance: parseFloat(user.walletBalance || "0"),
        totalEarnings: parseFloat(user.totalEarnings || "0"),
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Bad Request", message: "Email and password required" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const user = users[0];
    if (!user.isActive) {
      res.status(401).json({ error: "Unauthorized", message: "Account is deactivated" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id, user.role);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: {
        ...userWithoutPassword,
        walletBalance: parseFloat(user.walletBalance || "0"),
        totalEarnings: parseFloat(user.totalEarnings || "0"),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Login failed" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    const user = users[0];
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      walletBalance: parseFloat(user.walletBalance || "0"),
      totalEarnings: parseFloat(user.totalEarnings || "0"),
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
