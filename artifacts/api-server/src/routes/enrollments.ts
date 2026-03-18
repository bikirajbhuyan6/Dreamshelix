import { Router } from "express";
import { db } from "@workspace/db";
import {
  enrollmentsTable,
  coursesTable,
  notificationsTable,
  paymentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, req.userId!));
    const courseIds = enrollments.map((e) => e.courseId);
    
    const courses = courseIds.length > 0 
      ? await db.select().from(coursesTable).where(
          courseIds.length === 1 
            ? eq(coursesTable.id, courseIds[0]) 
            : coursesTable.id.inArray(courseIds)
        )
      : [];

    const courseMap = new Map(courses.map((c) => [c.id, c]));

    res.json(enrollments.map((e) => {
      const course = courseMap.get(e.courseId);
      return {
        ...e,
        course: course ? {
          ...course,
          price: parseFloat(course.price),
          originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : null,
          rating: parseFloat(course.rating || "0"),
        } : null,
      };
    }));
  } catch (error) {
    console.error("List enrollments error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { courseId, paymentId } = req.body;
    if (!courseId) {
      res.status(400).json({ error: "Bad Request", message: "courseId is required" });
      return;
    }

    // Check if already enrolled
    const existing = await db.select().from(enrollmentsTable).where(
      and(eq(enrollmentsTable.userId, req.userId!), eq(enrollmentsTable.courseId, courseId))
    ).limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "Bad Request", message: "Already enrolled in this course" });
      return;
    }

    // Get course for lesson count
    const courses = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    if (!courses.length) {
      res.status(404).json({ error: "Not Found", message: "Course not found" });
      return;
    }

    const course = courses[0];

    // Update total students
    await db.update(coursesTable).set({
      totalStudents: (course.totalStudents || 0) + 1,
    }).where(eq(coursesTable.id, courseId));

    const [enrollment] = await db.insert(enrollmentsTable).values({
      userId: req.userId!,
      courseId,
      progressPercent: 0,
      completedLessons: 0,
      totalLessons: 0,
      isCompleted: false,
    }).returning();

    // Send notification
    await db.insert(notificationsTable).values({
      userId: req.userId!,
      title: "Course Enrolled",
      message: `You've successfully enrolled in "${course.title}"`,
      type: "enrollment",
      isRead: false,
    });

    // If paid course, process commission
    if (paymentId && course.price) {
      const { referralsTable, earningsTable, usersTable } = await import("@workspace/db");
      const { eq: eqOp } = await import("drizzle-orm");
      
      // Find referral relationships for this user
      const userRec = await db.select().from(usersTable).where(eqOp(usersTable.id, req.userId!)).limit(1);
      if (userRec.length > 0 && userRec[0].referredById) {
        const coursePrice = parseFloat(course.price);
        const directCommission = coursePrice * 0.2;
        const referrerId = userRec[0].referredById;
        
        // Credit direct referrer
        await db.update(usersTable).set({
          walletBalance: String(parseFloat((await db.select().from(usersTable).where(eqOp(usersTable.id, referrerId)).limit(1))[0]?.walletBalance || "0") + directCommission),
          totalEarnings: String(parseFloat((await db.select().from(usersTable).where(eqOp(usersTable.id, referrerId)).limit(1))[0]?.totalEarnings || "0") + directCommission),
        }).where(eqOp(usersTable.id, referrerId));

        await db.insert(earningsTable).values({
          userId: referrerId,
          amount: directCommission.toString(),
          type: "direct_commission",
          status: "credited",
          description: `20% commission from ${course.title} enrollment`,
        });

        // Indirect commission (10%)
        const referrerRec = await db.select().from(usersTable).where(eqOp(usersTable.id, referrerId)).limit(1);
        if (referrerRec.length > 0 && referrerRec[0].referredById) {
          const indirectCommission = coursePrice * 0.1;
          const indirectReferrerId = referrerRec[0].referredById;
          
          await db.insert(earningsTable).values({
            userId: indirectReferrerId,
            amount: indirectCommission.toString(),
            type: "indirect_commission",
            status: "credited",
            description: `10% indirect commission from ${course.title} enrollment`,
          });
        }
      }
    }

    res.status(201).json(enrollment);
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:courseId/progress", authenticate, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const { lessonId, progressPercent } = req.body;

    const [enrollment] = await db.update(enrollmentsTable).set({
      progressPercent: progressPercent || 0,
      isCompleted: progressPercent >= 100,
      completedAt: progressPercent >= 100 ? new Date() : undefined,
    }).where(
      and(eq(enrollmentsTable.userId, req.userId!), eq(enrollmentsTable.courseId, courseId))
    ).returning();

    if (!enrollment) {
      res.status(404).json({ error: "Not Found", message: "Enrollment not found" });
      return;
    }

    // Send certificate notification if completed
    if (progressPercent >= 100) {
      const courses = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
      await db.insert(notificationsTable).values({
        userId: req.userId!,
        title: "Course Completed!",
        message: `Congratulations! You've completed "${courses[0]?.title}". Your certificate is ready!`,
        type: "certificate",
        isRead: false,
      });
    }

    res.json(enrollment);
  } catch (error) {
    console.error("Progress update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
