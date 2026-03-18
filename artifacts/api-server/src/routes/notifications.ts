import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, req.userId!))
      .orderBy(notificationsTable.createdAt);
    res.json(notifications);
  } catch (error) {
    console.error("List notifications error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:notificationId/read", authenticate, async (req: AuthRequest, res) => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    const [notification] = await db.update(notificationsTable).set({ isRead: true })
      .where(and(
        eq(notificationsTable.id, notificationId),
        eq(notificationsTable.userId, req.userId!)
      )).returning();

    if (!notification) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(notification);
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
