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
import { AnnouncementsManager } from "./views/admin/AnnouncementsManager";
import { UserDirectory } from "./views/admin/UserDirectory";
import { UserDetail } from "./views/admin/UserDetail";
import { BlogList } from "./views/admin/BlogList";
import { BlogEditor } from "./views/admin/BlogEditor";
import { AdminAnalytics } from "./views/admin/AdminAnalytics";
import { SystemSettings } from "./views/admin/SystemSettings";
import { AuditLog } from "./views/admin/AuditLog";
import FAQsManager from "./views/admin/FAQsManager";
import EmailTemplatesManager from "./views/admin/EmailTemplatesManager";
import BlogPost from "./views/BlogPost";

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
          <Route path="/resources/:slug" element={<BlogPost />} />
          
          {/* Admin Routes - Separate Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserDirectory />} />
            <Route path="users/:userId" element={<UserDetail />} />
            <Route path="announcements" element={<AnnouncementsManager />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/new" element={<BlogEditor />} />
            <Route path="blog/edit/:postId" element={<BlogEditor />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="faqs" element={<FAQsManager />} />
            <Route path="email-templates" element={<EmailTemplatesManager />} />
          </Route>
          
          {/* 404 - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
