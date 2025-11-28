import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// import TradesSync from "./components/TradesSync";
import { AccountPage } from "./pages/AccountPage";
// import { ToastProvider } from "@radix-ui/react-toast";
import { ToasterProvider } from "./components/ui/ToasterProvider";
import { MentorSharedView } from "./components/mentor/MentorSharedView";
// import { AccountsManager } from "./components/dashboard/AccountsManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToasterProvider />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/accounts/:id" element={<AccountPage />} />
          <Route path="/mentor/access/:token" element={<MentorSharedView />} />
        </Routes>

        {/* ✅ Place TradesSync inside Router (so it can use navigation if needed) */}
        {/* <div className="p-4">
          <TradesSync />
        </div> */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
