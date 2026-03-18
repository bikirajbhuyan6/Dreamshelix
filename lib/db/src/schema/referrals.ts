import { pgTable, serial, integer, decimal, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const referralLevelEnum = pgEnum("referral_level", ["direct", "indirect"]);
export const referralStatusEnum = pgEnum("referral_status", ["pending", "credited"]);
export const earningTypeEnum = pgEnum("earning_type", ["direct_commission", "indirect_commission"]);

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => usersTable.id),
  referredId: integer("referred_id").notNull().references(() => usersTable.id),
  level: referralLevelEnum("level").notNull().default("direct"),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: referralStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const earningsTable = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  referralId: integer("referral_id").references(() => referralsTable.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: earningTypeEnum("type").notNull(),
  status: referralStatusEnum("status").notNull().default("pending"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referralsTable.$inferSelect;
export type Earning = typeof earningsTable.$inferSelect;
