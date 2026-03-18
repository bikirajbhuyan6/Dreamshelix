import { Router } from "express";
import { db } from "@workspace/db";
import {
  coursesTable,
  courseSectionsTable,
  lessonsTable,
  enrollmentsTable,
} from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { authenticate, requireAdmin, AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, search, page = "1", limit = "12" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const offset = (pageNum - 1) * limitNum;

    let conditions: any[] = [eq(coursesTable.isPublished, true)];
    if (category && category !== "all") {
      conditions.push(eq(coursesTable.category, category as string));
    }
    if (search) {
      conditions.push(ilike(coursesTable.title, `%${search}%`));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const [courses, countResult] = await Promise.all([
      db.select().from(coursesTable).where(whereClause).limit(limitNum).offset(offset).orderBy(coursesTable.createdAt),
      db.select({ count: sql<number>`count(*)` }).from(coursesTable).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);
    res.json({
      courses: courses.map((c) => ({
        ...c,
        price: parseFloat(c.price),
        originalPrice: c.originalPrice ? parseFloat(c.originalPrice) : null,
        rating: parseFloat(c.rating || "0"),
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("List courses error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:courseId", async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const courses = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    if (courses.length === 0) {
      res.status(404).json({ error: "Not Found", message: "Course not found" });
      return;
    }

    const course = courses[0];
    const sections = await db.select().from(courseSectionsTable).where(eq(courseSectionsTable.courseId, courseId));
    const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, courseId));

    const curriculum = sections.map((s) => ({
      id: s.id,
      title: s.title,
      lessons: lessons.filter((l) => l.sectionId === s.id).map((l) => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        videoUrl: l.videoUrl,
        isPreview: l.isPreview,
      })),
    }));

    let isEnrolled = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Best effort check
    }

    res.json({
      ...course,
      price: parseFloat(course.price),
      originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : null,
      rating: parseFloat(course.rating || "0"),
      curriculum,
      whatYouLearn: course.whatYouLearn || [],
      requirements: course.requirements || [],
      isEnrolled,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      title, description, thumbnail, category, price, originalPrice,
      duration, level, language, instructor, tags, whatYouLearn, requirements, isPublished
    } = req.body;

    const [course] = await db.insert(coursesTable).values({
      title,
      description,
      thumbnail: thumbnail || null,
      category,
      price: price.toString(),
      originalPrice: originalPrice ? originalPrice.toString() : null,
      duration: duration || null,
      level: level || "beginner",
      language: language || "Hindi",
      instructor,
      tags: tags || [],
      whatYouLearn: whatYouLearn || [],
      requirements: requirements || [],
      isPublished: isPublished || false,
    }).returning();

    res.status(201).json({
      ...course,
      price: parseFloat(course.price),
      originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : null,
      rating: parseFloat(course.rating || "0"),
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:courseId", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const updateData = req.body;

    const [course] = await db.update(coursesTable).set({
      ...updateData,
      price: updateData.price ? updateData.price.toString() : undefined,
      originalPrice: updateData.originalPrice ? updateData.originalPrice.toString() : undefined,
      updatedAt: new Date(),
    }).where(eq(coursesTable.id, courseId)).returning();

    if (!course) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    res.json({
      ...course,
      price: parseFloat(course.price),
      originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : null,
      rating: parseFloat(course.rating || "0"),
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:courseId", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    await db.delete(coursesTable).where(eq(coursesTable.id, courseId));
    res.status(204).send();
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
