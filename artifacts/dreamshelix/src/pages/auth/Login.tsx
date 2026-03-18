import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuthStore();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        setLocation(data.user.role === 'admin' ? '/admin' : '/dashboard');
      },
      onError: (err: any) => {
        toast({ 
          variant: "destructive", 
          title: "Login Failed", 
          description: err?.message || "Invalid credentials. Please try again." 
        });
      }
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full" />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-12 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-3xl text-white">Dreamshelix</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-muted-foreground mb-8">Sign in to continue your learning journey.</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Email Address</label>
              <Input 
                {...form.register("email")}
                placeholder="you@example.com"
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary"
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-white/80">Password</label>
                <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
              </div>
              <Input 
                {...form.register("password")}
                type="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary"
              />
              {form.formState.errors.password && (
                <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full h-12 rounded-xl bg-white text-background font-bold text-base hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account? <Link href="/register" className="text-white font-medium hover:text-primary transition-colors">Create one</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden md:block w-1/2 relative bg-secondary/30 border-l border-white/5 p-12">
        <div className="absolute inset-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Abstract"
            className="w-full h-full object-cover opacity-30 mix-blend-screen"
          />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-end pb-12">
          <div className="glass-panel p-8 rounded-3xl max-w-lg">
            <h3 className="font-display text-2xl font-bold text-white mb-4">"The best investment you can make is in yourself."</h3>
            <p className="text-white/70">Join thousands of students mastering top-tier skills and earning through our affiliate program.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
