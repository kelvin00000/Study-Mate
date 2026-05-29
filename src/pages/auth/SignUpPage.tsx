import { useSignUp, useAuth} from '@clerk/clerk-react'
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react';
import Logo from "../../components/Logo";
import LoadingScreen from '../../components/LoadingScreen';


const SignUpPage = () => {
    const [ showLoader, setShowLoader ] = useState(false)
    const { signUp, isLoaded } = useSignUp()
    const { getToken } = useAuth()
    const token = getToken()

    const handleSignUp = async ()=>{
        setShowLoader(true)
        if (!isLoaded || !token) return
        try {
            await signUp!.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/onBoarding',
            })

            await fetch('https://studymate-backend-dhnt.onrender.com/auth/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            setShowLoader(false)
        } catch (err) {
            console.error('Google sign-up error:', err);
            setShowLoader(false)
        }
    }


    return (
        <>
            <title>Sign Up</title>

            <main className="flex items-center justify-center px-1 lg:px-0 py-5 lg:py-3 h-screen w-full font-(--fam-normal) bg-(--background)">
                <section className="flex-col items-start p-6 h-full w-[97%] lg:w-[35%] overflow-hidden rounded-3xl bg-[#F2F0FD] shadow-xl shadow-gray-300">
                    <Logo subtitle="Your Smart Study Companion" />

                    <div className="flex-col items-start mt-[40px] lg:mt-[30px] w-[90%] lg:w-[70%]">
                        <p className="font-bold block text-4xl lg:text-3xl">Learn More.</p>
                        <p className="font-bold block text-4xl lg:text-3xl text-(--primary)">Achieve More.</p>
                        <div className="h-[20px] text-sm text-var(--muted)">
                            Manage your courses, track progess and achieve your academic goals with ease.
                        </div>
                    </div>

                    <div className="flex items-center justify-center mt-16 lg:mt-12 full h-[45%] bg-[#D7C5FB] rounded-2xl overflow-hidden">
                        <img
                            src="/image-3.png"
                            alt="Students learning"
                            className="mb-[8%] w-full lg:w-[65%] object-contain"
                        />
                    </div>

                    <button
                        className="mt-[20%] lg:mt-6 ml-[15%] lg:ml-[25%] flex h-14 w-[70%] lg:w-[50%] items-center justify-center gap-3 rounded-xl border border-(--border) bg-white text-sm font-medium text-(--foreground) transition hover:bg-gray-50 cursor-pointer"
                        onClick={()=>{ handleSignUp() }}
                        >
                            <FcGoogle className="text-xl" />
                            Continue with Google
                    </button>
                </section>
            </main>

            <LoadingScreen loading={showLoader} />
        </>
    );
};

export default SignUpPage;
