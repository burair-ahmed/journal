import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AccountPage } from "./pages/AccountPage";
import { ToasterProvider } from "./components/ui/ToasterProvider";
import { MentorSharedView } from "./components/mentor/MentorSharedView";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./views/admin/AdminDashboard";
import { UserDirectory } from "./views/admin/UserDirectory";
import { UserDetail } from "./views/admin/UserDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToasterProvider />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/accounts/:id" element={<AccountPage />} />
          <Route path="/mentorship" element={<Index />} />
          <Route path="/trade-replay" element={<Index />} />
          <Route path="/mentor/access/:token" element={<MentorSharedView />} />
          
          {/* Admin Routes - Separate Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserDirectory />} />
            <Route path="users/:userId" element={<UserDetail />} />
            <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground">Coming soon</p></div>} />
            <Route path="blog" element={<div className="p-6"><h1 className="text-2xl font-bold">Blog Management</h1><p className="text-muted-foreground">Coming soon</p></div>} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Coming soon</p></div>} />
          </Route>
          
          {/* 404 - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
