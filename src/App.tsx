import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MCQTest from "./pages/MCQTest";
import CodingTest from "./pages/CodingTest";
import Results from "./pages/Results";
import AdminPanel from "./pages/AdminPanel";
import AdminCandidateDetail from "./pages/AdminCandidateDetail";
import CertificateVerify from "./pages/CertificateVerify";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><ProtectedRoute><Dashboard /></ProtectedRoute></PageTransition>} />
        <Route path="/test/mcq/:sessionId" element={<PageTransition><ProtectedRoute><MCQTest /></ProtectedRoute></PageTransition>} />
        <Route path="/test/coding/:sessionId" element={<PageTransition><ProtectedRoute><CodingTest /></ProtectedRoute></PageTransition>} />
        <Route path="/results/:sessionId" element={<PageTransition><ProtectedRoute><Results /></ProtectedRoute></PageTransition>} />
        <Route path="/admin" element={<PageTransition><ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute></PageTransition>} />
        <Route path="/admin/candidate/:sessionId" element={<PageTransition><ProtectedRoute requireAdmin><AdminCandidateDetail /></ProtectedRoute></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
        <Route path="/verify/:certificateId" element={<PageTransition><CertificateVerify /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
