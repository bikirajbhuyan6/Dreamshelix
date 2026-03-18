import { motion } from "framer-motion";
import { Link } from "wouter";
import { Star, Clock, Users, PlayCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@workspace/api-client-react/src/generated/api.schemas";

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500"
    >
      {/* Image container */}
      <div className="relative aspect-video overflow-hidden bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10 opacity-60 mix-blend-multiply" />
        
        {/* Placeholder logic if no thumbnail */}
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
        ) : (
          <img 
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop&q=80"
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80"
          />
        )}
        
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-white border border-white/20 capitalize">
            {course.level}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/80 backdrop-blur-md text-white">
            {course.category}
          </span>
        </div>
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-[0_0_30px_rgba(var(--primary),0.5)]">
            <PlayCircle className="w-6 h-6 fill-current" />
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-accent fill-accent" /> {course.rating.toFixed(1)}</span>
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {course.totalStudents}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.duration || '8h'}</span>
        </div>
        
        <h3 className="font-display font-bold text-xl text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
              {course.originalPrice ? formatCurrency(course.originalPrice) : formatCurrency(course.price * 1.5)}
            </span>
            <span className="font-display font-bold text-xl text-white">
              {formatCurrency(course.price)}
            </span>
          </div>
          
          <Link 
            href={`/courses/${course.id}`}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-primary text-white font-medium transition-colors border border-white/10"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
