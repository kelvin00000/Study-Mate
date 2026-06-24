import { Route, Routes, useLocation } from "react-router";
import SignUpPage from "./pages/auth/SignUpPage";
import "./App.css";
import OnboardingPage from "./pages/auth/onboarding/OnboardingPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import {
  RedirectIfAuth,
  RequireAuth,
  RequireOnboarded,
} from "./components/RouteGuards";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import EditCoursePage from "./pages/EditCoursePage";
import TopicChatPage from "./pages/TopicChatPage";
import TopicQuizPage from "./pages/TopicQuizPage";
import SettingsPage from "./pages/SettingsPage";
import QuickChatPage from "./pages/QuickChatPage";
import AchievementsPage from "./pages/AchievementsPage";

function App() {
  const location = useLocation();
  console.log("Current location:", location.pathname);

  return (
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
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
