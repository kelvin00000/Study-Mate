import { Route, Routes, useLocation } from "react-router";
import { lazy, Suspense } from "react";
import "./App.css";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import {
  RedirectIfAuth,
  RequireAuth,
  RequireOnboarded,
} from "./components/RouteGuards";

// Eagerly loaded (landing + auth flow)
import SignUpPage from "./pages/auth/SignUpPage";
import OnboardingPage from "./pages/auth/onboarding/OnboardingPage";

// Lazy loaded (post-auth pages)
const HomePage = lazy(() => import("./pages/HomePage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const EditCoursePage = lazy(() => import("./pages/EditCoursePage"));
const TopicChatPage = lazy(() => import("./pages/TopicChatPage"));
const TopicQuizPage = lazy(() => import("./pages/TopicQuizPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const QuickChatPage = lazy(() => import("./pages/QuickChatPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const PaymentCallbackPage = lazy(() => import("./pages/PaymentCallbackPage"));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
    </div>
  );
}

function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <RedirectIfAuth>
              <SignUpPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/sso-callback"
          element={<AuthenticateWithRedirectCallback />}
        />

        <Route element={<RequireAuth />}>
          <Route path="/onBoarding" element={<OnboardingPage />} />
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />

          <Route element={<RequireOnboarded />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/courses/:id/edit" element={<EditCoursePage />} />
            <Route path="/courses/:courseId/topics/:topicIndex" element={<TopicChatPage />} />
            <Route path="/courses/:courseId/topics/:topicIndex/quiz" element={<TopicQuizPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/quick-chat" element={<QuickChatPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
