import { pgTable, serial, text, boolean, decimal, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const levelEnum = pgEnum("level", ["beginner", "intermediate", "advanced"]);

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  duration: text("duration"),
  level: levelEnum("level").notNull().default("beginner"),
  language: text("language").notNull().default("Hindi"),
  instructor: text("instructor").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  totalStudents: integer("total_students").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
  tags: text("tags").array(),
  whatYouLearn: text("what_you_learn").array(),
  requirements: text("requirements").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const courseSectionsTable = pgTable("course_sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull().references(() => courseSectionsTable.id),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  title: text("title").notNull(),
  duration: text("duration").notNull().default("0:00"),
  videoUrl: text("video_url"),
  isPreview: boolean("is_preview").notNull().default(false),
  position: integer("position").notNull().default(0),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
export type CourseSection = typeof courseSectionsTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;
