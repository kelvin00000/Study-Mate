import { Route, Routes, useLocation } from 'react-router';
import SignUpPage from './pages/auth/SignUpPage';
import './App.css'
import OnboardingPage from './pages/auth/onboarding/OnboardingPage';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'


function App() {
    const location = useLocation();

    return (
        <>
            <Routes location={location} key={location.pathname}>
                <Route path='/' element={<SignUpPage />} />
                <Route path="/onBoarding" element={<OnboardingPage />} />
                <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
            </Routes>
        </>
    )
}

export default App
