import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectBoardPage from "./pages/ProjectBoardPage";
import ProjectSpinUpPage from "./pages/ProjectSpinUpPage";
import IntakeChatPage from "./pages/IntakeChatPage";
import OrchestrationPage from "./pages/OrchestrationPage";
import SettingsPage from "./pages/SettingsPage";
import PricingPage from "./pages/PricingPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import SupportSLAQueuePage from "./pages/SupportSLAQueuePage";
import NotFoundPage from "./pages/NotFoundPage";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/email-verification" element={<EmailVerificationPage />} />
              <Route path="/forgot-password" element={<PasswordResetPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects/:id" element={<ProjectBoardPage />} />
              <Route path="/spin-up" element={<ProjectSpinUpPage />} />
              <Route path="/intake" element={<IntakeChatPage />} />
              <Route path="/orchestration" element={<OrchestrationPage />} />
              <Route path="/orchestration/*" element={<OrchestrationPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/support" element={<SupportSLAQueuePage />} />
              <Route path="/auth/callback" element={<OAuthCallbackPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
