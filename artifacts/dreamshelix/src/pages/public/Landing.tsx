import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Target, Zap, Shield, ChevronRight, Play } from "lucide-react";
import { CourseCard } from "@/components/ui/course-card";
import { useListCourses } from "@workspace/api-client-react";

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Fetch some featured courses
  const { data, isLoading } = useListCourses({ page: 1, limit: 3 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image & Effects */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Abstract dark tech background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          <motion.div style={{ y }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60 mix-blend-screen" />
        </div>

        {/* Floating Shapes */}
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/abstract-shape-1.png`}
          alt="Floating shape"
          className="absolute top-1/4 right-[10%] w-64 h-64 object-contain opacity-50 z-0 hidden lg:block"
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/abstract-shape-2.png`}
          alt="Floating shape"
          className="absolute bottom-1/4 left-[5%] w-48 h-48 object-contain opacity-40 z-0 hidden lg:block"
          animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-primary/30">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-white">India's Premier EdTech Platform</span>
              </div>
              
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-6 text-white">
                Master the skills of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  tomorrow.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                Unlock your potential with industry-leading courses. Learn from experts, build real-world projects, and earn through our powerful referral network.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/courses" 
                  className="px-8 py-4 rounded-full bg-white text-background font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group"
                >
                  Explore Courses
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/refer" 
                  className="px-8 py-4 rounded-full glass-panel text-white font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Refer & Earn
                </Link>
              </div>

              <div className="mt-16 flex items-center gap-8 border-t border-white/10 pt-8">
                <div>
                  <div className="font-display font-bold text-3xl text-white">50k+</div>
                  <div className="text-sm text-muted-foreground">Active Learners</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="font-display font-bold text-3xl text-white">200+</div>
                  <div className="text-sm text-muted-foreground">Premium Courses</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="font-display font-bold text-3xl text-white">₹1Cr+</div>
                  <div className="text-sm text-muted-foreground">Student Earnings</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 text-white">Why choose Dreamshelix?</h2>
            <p className="text-muted-foreground text-lg">We combine world-class education with an unparalleled earning opportunity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Industry-Ready Curriculum", desc: "Learn exactly what companies are hiring for right now." },
              { icon: Zap, title: "Learn & Earn Ecosystem", desc: "Share your learning journey and earn lifetime commissions." },
              { icon: Shield, title: "Verified Certifications", desc: "Get credentials that actually matter to employers." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-8 rounded-3xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="py-24 bg-secondary/30 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-white">Trending Courses</h2>
              <p className="text-muted-foreground">Start your journey with our most popular programs.</p>
            </div>
            <Link href="/courses" className="hidden md:flex items-center gap-2 text-primary hover:text-white font-medium transition-colors">
              View all courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="h-[400px] rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.courses?.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
              {/* Fallback if no data */}
              {!data?.courses?.length && [1,2,3].map((i) => (
                <CourseCard key={i} index={i} course={{
                  id: i, title: `Advanced Full-Stack Development ${i}`, description: "Master React, Node.js and more.",
                  category: "Development", level: "intermediate", price: 4999, originalPrice: 9999, rating: 4.8, totalStudents: 1200,
                  instructor: "John Doe", isPublished: true, createdAt: new Date().toISOString()
                }} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
            <Link href="/courses" className="inline-flex items-center gap-2 text-primary font-medium">
              View all courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
