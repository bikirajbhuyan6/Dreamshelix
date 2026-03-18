import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuthStore();
  const { toast } = useToast();
  
  // Try to get referral code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref') || "";

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", referralCode: refCode }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        toast({ title: "Account created!", description: "Welcome to Dreamshelix." });
        setLocation(data.user.role === 'admin' ? '/admin' : '/dashboard');
      },
      onError: (err: any) => {
        toast({ 
          variant: "destructive", 
          title: "Registration Failed", 
          description: err?.message || "Could not create account. Try again." 
        });
      }
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ data });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      </div>

      <div className="hidden md:block w-1/2 relative bg-secondary/30 border-r border-white/5">
        <div className="absolute inset-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Abstract"
            className="w-full h-full object-cover opacity-20 mix-blend-screen scale-x-[-1]"
          />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center p-12 lg:p-24">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Start Learning. <br/> Start Earning.
          </h2>
          <ul className="space-y-6 text-white/80">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">✓</div>
              Access to premium courses
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">✓</div>
              Verified certifications
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">✓</div>
              High-paying referral program
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 z-10 min-h-screen overflow-y-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-8 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-8">Join the fastest growing EdTech community in India.</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Full Name</label>
              <Input 
                {...form.register("name")}
                placeholder="John Doe"
                className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
              />
              {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Email Address</label>
              <Input 
                {...form.register("email")}
                placeholder="you@example.com"
                className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
              />
              {form.formState.errors.email && <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Password</label>
                <Input 
                  {...form.register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                />
                {form.formState.errors.password && <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Phone (Optional)</label>
                <Input 
                  {...form.register("phone")}
                  placeholder="+91..."
                  className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Referral Code (Optional)</label>
              <Input 
                {...form.register("referralCode")}
                placeholder="Enter code if you have one"
                className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus-visible:ring-accent focus-visible:border-accent"
              />
            </div>

            <Button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="w-full h-12 mt-4 rounded-xl bg-white text-background font-bold text-base hover:bg-white/90 transition-all"
            >
              {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account? <Link href="/login" className="text-white font-medium hover:text-primary transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
