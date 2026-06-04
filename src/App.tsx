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
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
