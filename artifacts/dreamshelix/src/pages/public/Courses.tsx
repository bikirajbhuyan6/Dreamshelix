import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/ui/course-card";
import { useListCourses } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Courses() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  
  const { data, isLoading } = useListCourses({ search, category, limit: 12 });

  const categories = ["All", "Development", "Design", "Marketing", "Business", "IT & Software"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white">Explore Courses</h1>
            <p className="text-muted-foreground text-lg">Browse our premium catalog of industry-ready programs.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === "All" ? "" : cat)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    (category === cat || (cat === "All" && !category))
                      ? "bg-primary text-white"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search courses..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white rounded-full h-11 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-[400px] rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {data?.courses?.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-3xl">
                  <p className="text-xl font-medium text-white mb-2">No courses found</p>
                  <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {data?.courses?.map((course, i) => (
                    <CourseCard key={course.id} course={course} index={i} />
                  ))}
                  
                  {/* Mock data if API is empty for presentation */}
                  {!data?.courses && [1,2,3,4].map((i) => (
                    <CourseCard key={i} index={i} course={{
                      id: i, title: `Premium Mock Course ${i}`, description: "Learn amazing skills to boost your career.",
                      category: "Design", level: "beginner", price: 2999, originalPrice: 5999, rating: 4.9, totalStudents: 850,
                      instructor: "Jane Smith", isPublished: true, createdAt: new Date().toISOString()
                    }} />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
      
      <Footer />
    </div>
  );
}
