import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMe, useGetReferralEarnings, useListMyEnrollments } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Users, BookOpen, ArrowUpRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function StudentDashboard() {
  const headers = getAuthHeaders();
  
  const { data: user } = useGetMe({ request: { headers } });
  const { data: earnings } = useGetReferralEarnings({ request: { headers } });
  const { data: enrollments } = useListMyEnrollments({ request: { headers } });

  const stats = [
    { 
      label: "Wallet Balance", 
      value: formatCurrency(earnings?.walletBalance || 0), 
      icon: Wallet, 
      color: "text-primary", 
      bg: "bg-primary/10" 
    },
    { 
      label: "Total Earnings", 
      value: formatCurrency(earnings?.totalEarnings || 0), 
      icon: TrendingUp, 
      color: "text-accent", 
      bg: "bg-accent/10" 
    },
    { 
      label: "Enrolled Courses", 
      value: enrollments?.length || 0, 
      icon: BookOpen, 
      color: "text-blue-400", 
      bg: "bg-blue-400/10" 
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">Here's an overview of your learning and earning progress.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-display font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Continue Learning</h2>
              <Link href="/dashboard/courses" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {enrollments?.slice(0, 3).map((enrollment) => (
                <div key={enrollment.id} className="glass-card p-4 rounded-xl flex items-center gap-4">
                  <div className="w-24 h-16 rounded-lg bg-secondary overflow-hidden shrink-0">
                    {enrollment.course?.thumbnail && <img src={enrollment.course.thumbnail} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-white line-clamp-1">{enrollment.course?.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-grow h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${enrollment.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-8">{enrollment.progressPercent}%</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/courses/${enrollment.courseId}/learn`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors shrink-0">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </Link>
                </div>
              ))}
              {(!enrollments || enrollments.length === 0) && (
                <div className="text-center py-10 border border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                  <Link href="/courses" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Browse Courses</Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Referral Widget */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Your Referral Code</h2>
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 mx-auto flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Invite & Earn</h3>
              <p className="text-sm text-muted-foreground mb-6">Share your code and earn up to ₹1000 per enrollment.</p>
              
              <div className="bg-background border border-border p-3 rounded-xl flex items-center justify-between">
                <span className="font-mono font-bold tracking-wider text-white ml-2">{user?.referralCode || 'LOAD...'}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user?.referralCode || '');
                    // would add toast here
                  }}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-bold uppercase"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
