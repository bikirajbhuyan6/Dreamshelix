import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import coursesRouter from "./courses.js";
import enrollmentsRouter from "./enrollments.js";
import referralsRouter from "./referrals.js";
import paymentsRouter from "./payments.js";
import withdrawalsRouter from "./withdrawals.js";
import notificationsRouter from "./notifications.js";
import adminRouter from "./admin.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/courses", coursesRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/referrals", referralsRouter);
router.use("/payments", paymentsRouter);
router.use("/withdrawals", withdrawalsRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);

export default router;
