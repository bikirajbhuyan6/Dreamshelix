import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Users, BookOpen, IndianRupee, Banknote } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    request: { headers: getAuthHeaders() }
  });

  const cards = [
    { title: "Total Revenue", value: formatCurrency(stats?.totalRevenue || 0), icon: IndianRupee, color: "text-green-400" },
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-400" },
    { title: "Enrollments", value: stats?.totalEnrollments || 0, icon: BookOpen, color: "text-purple-400" },
    { title: "Pending Payouts", value: formatCurrency(stats?.totalWithdrawalAmount || 0), icon: Banknote, color: "text-accent" },
  ];

  return (
    <DashboardLayout isAdmin>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Overview</h1>
          <p className="text-muted-foreground">Platform analytics and metrics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-muted-foreground font-medium">{card.title}</h3>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-3xl font-display font-bold text-white">
                {isLoading ? "..." : card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="xl:col-span-2 glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Revenue Overview</h3>
            <div className="h-[300px] w-full">
              {stats?.revenueChart && stats.revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="label" stroke="#ffffff50" tick={{fill: '#ffffff50'}} axisLine={false} />
                    <YAxis stroke="#ffffff50" tick={{fill: '#ffffff50'}} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 0}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl">
                  Not enough data for chart
                </div>
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Top Courses</h3>
            <div className="space-y-4">
              {stats?.topCourses?.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div>
                    <h4 className="font-medium text-white line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-muted-foreground">{course.enrollments} enrollments</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(course.revenue)}</p>
                  </div>
                </div>
              ))}
              {!stats?.topCourses?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">No course data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
