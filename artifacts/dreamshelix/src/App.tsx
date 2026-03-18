import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public Pages
import Landing from "@/pages/public/Landing";
import Courses from "@/pages/public/Courses";
// import CourseDetail from "@/pages/public/CourseDetail";
// import Refer from "@/pages/public/Refer";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Dashboard Pages
import StudentDashboard from "@/pages/student/Dashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Landing} />
      <Route path="/courses" component={Courses} />
      
      {/* Auth */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected - Student */}
      <Route path="/dashboard" component={StudentDashboard} />
      
      {/* Protected - Admin */}
      <Route path="/admin" component={AdminDashboard} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
