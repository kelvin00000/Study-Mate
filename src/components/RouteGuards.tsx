import { useUser } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';




// Wraps routes that require the user to be signed in
export const RequireAuth = () => {
    const { isLoaded, isSignedIn } = useUser();
    if (!isLoaded) return <LoadingScreen loading={true} />;
    if (!isSignedIn) return <Navigate to="/" replace />;
    return <Outlet />;
};



// Wraps routes that require onboarding to be complete
export const RequireOnboarded = () => {
    const { isLoaded, user } = useUser();
    if (!isLoaded) return <LoadingScreen loading={true} />;
    if (!user?.publicMetadata?.onboarded) return <Navigate to="/onBoarding" replace />;
    return <Outlet />;
};

// Wraps public routes — redirects away if already authenticated
export const RedirectIfAuth = ({ children }: { children: React.ReactNode }) => {
    const { isLoaded, isSignedIn, user } = useUser();
    if (!isLoaded) return <LoadingScreen loading={true} />;
    if (isSignedIn) {
        if (user?.publicMetadata?.onboarded) return <Navigate to="/dashboard" replace />;
        return <Navigate to="/onBoarding" replace />;
    }
    return <>{children}</>;
};
