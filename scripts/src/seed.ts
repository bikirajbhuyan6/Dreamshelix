import { db } from "@workspace/db";
import {
  usersTable,
  coursesTable,
  courseSectionsTable,
  lessonsTable,
  enrollmentsTable,
  referralsTable,
  notificationsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const [admin] = await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@dreamshelix.in",
    passwordHash: adminPasswordHash,
    role: "admin",
    referralCode: "ADMIN001",
    walletBalance: "0",
    totalEarnings: "0",
    isActive: true,
  }).onConflictDoNothing().returning();

  // Create student user
  const studentPasswordHash = await bcrypt.hash("student123", 12);
  const [student] = await db.insert(usersTable).values({
    name: "Ravi Kumar",
    email: "student@dreamshelix.in",
    passwordHash: studentPasswordHash,
    role: "student",
    referralCode: "RAVI2024",
    walletBalance: "1250",
    totalEarnings: "3500",
    isActive: true,
  }).onConflictDoNothing().returning();

  if (!admin || !student) {
    console.log("Users already seeded, skipping...");
    return;
  }

  // Create courses
  const coursesData = [
    {
      title: "Stock Market Mastery for Beginners",
      description: "Learn the fundamentals of stock market investing, technical analysis, and wealth creation strategies. This comprehensive course covers everything from basic concepts to advanced trading strategies.",
      thumbnail: "/images/hero-bg.png",
      category: "Finance & Investment",
      price: "4999",
      originalPrice: "9999",
      duration: "40 hours",
      level: "beginner" as const,
      language: "Hindi",
      instructor: "CA Rahul Sharma",
      rating: "4.8",
      totalStudents: 12500,
      isPublished: true,
      tags: ["stock market", "investing", "finance", "wealth"],
      whatYouLearn: [
        "Understand stock market fundamentals",
        "Technical analysis and chart reading",
        "Portfolio management strategies",
        "Risk management techniques",
        "Build a profitable investment strategy",
      ],
      requirements: [
        "Basic computer knowledge",
        "Smartphone or laptop",
        "Interest in financial markets",
      ],
    },
    {
      title: "Digital Marketing Complete Course 2024",
      description: "Master digital marketing from SEO, social media, Google Ads, content marketing, and email marketing. Learn from industry experts and build a successful online marketing career.",
      thumbnail: "/images/abstract-shape-1.png",
      category: "Digital Marketing",
      price: "3999",
      originalPrice: "7999",
      duration: "35 hours",
      level: "beginner" as const,
      language: "Hindi & English",
      instructor: "Priya Mehta",
      rating: "4.7",
      totalStudents: 8900,
      isPublished: true,
      tags: ["digital marketing", "SEO", "social media", "google ads"],
      whatYouLearn: [
        "SEO and content marketing strategies",
        "Social media marketing mastery",
        "Google and Facebook Ads",
        "Email marketing campaigns",
        "Analytics and reporting",
      ],
      requirements: [
        "Basic internet knowledge",
        "Computer or smartphone",
      ],
    },
    {
      title: "Python Programming for Data Science",
      description: "Learn Python programming from scratch and advance to data science, machine learning, and AI. Build real-world projects and become job-ready in the tech industry.",
      thumbnail: "/images/abstract-shape-2.png",
      category: "Technology",
      price: "5999",
      originalPrice: "11999",
      duration: "60 hours",
      level: "intermediate" as const,
      language: "Hindi & English",
      instructor: "Dr. Amit Singh",
      rating: "4.9",
      totalStudents: 15200,
      isPublished: true,
      tags: ["python", "data science", "machine learning", "AI"],
      whatYouLearn: [
        "Python fundamentals and advanced concepts",
        "Data analysis with Pandas and NumPy",
        "Machine learning algorithms",
        "Deep learning with TensorFlow",
        "Real-world project portfolio",
      ],
      requirements: [
        "Basic math knowledge",
        "Computer with 8GB RAM",
        "Eagerness to learn",
      ],
    },
    {
      title: "Business Communication & Leadership",
      description: "Develop exceptional communication skills, leadership qualities, and business acumen. Perfect for professionals looking to advance their careers or start their own business.",
      thumbnail: "/images/logo.png",
      category: "Business",
      price: "2999",
      originalPrice: "5999",
      duration: "20 hours",
      level: "beginner" as const,
      language: "Hindi & English",
      instructor: "MBA Sunita Patel",
      rating: "4.6",
      totalStudents: 5400,
      isPublished: true,
      tags: ["business", "communication", "leadership", "management"],
      whatYouLearn: [
        "Effective communication techniques",
        "Leadership and team management",
        "Business presentation skills",
        "Negotiation strategies",
        "Professional email writing",
      ],
      requirements: [
        "Basic English knowledge",
        "Willingness to practice",
      ],
    },
    {
      title: "Graphic Design with Adobe Photoshop & Illustrator",
      description: "Master graphic design tools and create stunning visual content for social media, branding, and marketing. Build a professional portfolio that lands clients.",
      thumbnail: "/images/hero-bg.png",
      category: "Design",
      price: "4499",
      originalPrice: "8999",
      duration: "45 hours",
      level: "beginner" as const,
      language: "Hindi",
      instructor: "Vikram Desai",
      rating: "4.7",
      totalStudents: 6800,
      isPublished: true,
      tags: ["graphic design", "photoshop", "illustrator", "design"],
      whatYouLearn: [
        "Adobe Photoshop from beginner to pro",
        "Illustrator for vector graphics",
        "Social media design templates",
        "Logo and brand identity design",
        "Freelance graphic design business",
      ],
      requirements: [
        "Computer with Adobe Creative Suite",
        "Basic computer skills",
      ],
    },
    {
      title: "Real Estate Investment & Property Management",
      description: "Discover profitable real estate investment strategies in the Indian market. Learn property valuation, legal aspects, rental income, and how to build a real estate portfolio.",
      thumbnail: "/images/abstract-shape-1.png",
      category: "Finance & Investment",
      price: "6999",
      originalPrice: "13999",
      duration: "30 hours",
      level: "intermediate" as const,
      language: "Hindi",
      instructor: "Suresh Kumar",
      rating: "4.5",
      totalStudents: 3200,
      isPublished: true,
      tags: ["real estate", "property", "investment", "rental income"],
      whatYouLearn: [
        "Real estate market analysis",
        "Property valuation techniques",
        "Legal documentation and registration",
        "Rental income strategies",
        "Building a real estate portfolio",
      ],
      requirements: [
        "Basic financial knowledge",
        "Interest in real estate",
      ],
    },
  ];

  const insertedCourses = await db.insert(coursesTable).values(coursesData).returning();

  // Add sections and lessons to first course
  const [section1] = await db.insert(courseSectionsTable).values({
    courseId: insertedCourses[0].id,
    title: "Introduction to Stock Market",
    position: 1,
  }).returning();

  const [section2] = await db.insert(courseSectionsTable).values({
    courseId: insertedCourses[0].id,
    title: "Technical Analysis",
    position: 2,
  }).returning();

  await db.insert(lessonsTable).values([
    { sectionId: section1.id, courseId: insertedCourses[0].id, title: "What is Stock Market?", duration: "15:30", isPreview: true, position: 1 },
    { sectionId: section1.id, courseId: insertedCourses[0].id, title: "How BSE and NSE Work", duration: "20:00", isPreview: false, position: 2 },
    { sectionId: section1.id, courseId: insertedCourses[0].id, title: "Types of Stocks", duration: "18:45", isPreview: false, position: 3 },
    { sectionId: section2.id, courseId: insertedCourses[0].id, title: "Reading Candlestick Charts", duration: "25:00", isPreview: true, position: 1 },
    { sectionId: section2.id, courseId: insertedCourses[0].id, title: "Support and Resistance Levels", duration: "22:30", isPreview: false, position: 2 },
    { sectionId: section2.id, courseId: insertedCourses[0].id, title: "Moving Averages and Indicators", duration: "30:00", isPreview: false, position: 3 },
  ]);

  // Enroll student in first course
  await db.insert(enrollmentsTable).values({
    userId: student.id,
    courseId: insertedCourses[0].id,
    progressPercent: 65,
    completedLessons: 4,
    totalLessons: 6,
    isCompleted: false,
  });

  await db.insert(enrollmentsTable).values({
    userId: student.id,
    courseId: insertedCourses[1].id,
    progressPercent: 30,
    completedLessons: 2,
    totalLessons: 8,
    isCompleted: false,
  });

  // Create a referral student
  const ref2Hash = await bcrypt.hash("pass123", 12);
  const [ref2] = await db.insert(usersTable).values({
    name: "Anjali Singh",
    email: "anjali@example.com",
    passwordHash: ref2Hash,
    role: "student",
    referralCode: nanoid(8).toUpperCase(),
    referredById: student.id,
    walletBalance: "0",
    totalEarnings: "0",
    isActive: true,
  }).returning();

  // Add referral record
  await db.insert(referralsTable).values({
    referrerId: student.id,
    referredId: ref2.id,
    level: "direct",
    commissionAmount: "1000",
    status: "credited",
  });

  // Add notifications
  await db.insert(notificationsTable).values([
    {
      userId: student.id,
      title: "Welcome to Dreamshelix India!",
      message: "Start your learning journey today. Explore our top courses and kick-start your career.",
      type: "system",
      isRead: false,
    },
    {
      userId: student.id,
      title: "New Referral",
      message: "Anjali Singh joined using your referral link! ₹1000 commission credited to your wallet.",
      type: "referral",
      isRead: false,
    },
    {
      userId: student.id,
      title: "Course Enrolled",
      message: "You've successfully enrolled in 'Stock Market Mastery for Beginners'",
      type: "enrollment",
      isRead: true,
    },
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("📧 Admin: admin@dreamshelix.in / admin123");
  console.log("📧 Student: student@dreamshelix.in / student123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
