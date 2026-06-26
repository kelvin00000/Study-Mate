import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Logo from "../../../components/Logo";
import { onboardingSteps } from "../../../constants/Onboardingdata";
import StepForm from "./StepForm";
import InterestsForm from "./InterestForm";
import FinalOnboardingScreen from "./FinalOnboardingScreen";
import MessageModal from "../../../components/Modal";
import LoadingScreen from "../../../components/LoadingScreen";
import { useSubmitPreference, useSyncUser } from "../../../hooks/useSubmitPreference";


export default function OnboardingPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [ step, setStep ] = useState(0);
    const [ onboardingInfo, setOnboardingInfo ] = useState<{selections: {title:string, selection:string}[], interests:string[]}>({selections:[], interests:[]})
    const [ latestStepSelection, setLatestStepSelection ] = useState<{title:string, selection:string}>()
    const [ selectedInterests, setSelectedInterests ] = useState<string[]>([])
    const [ showMessageModal, setShowMessageModal ] = useState(false)
    const [ showLoader, setShowLoader ] = useState(false)
    const [ syncing, setSyncing ] = useState(true)
    const { mutateAsync: submitPreference,isPending } = useSubmitPreference()
    const syncUser = useSyncUser()

    useEffect(() => {
        if (user && user.publicMetadata?.onboarded === true) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        syncUser.mutateAsync()
            .catch((err) => console.error('Sync error (non-fatal):', err))
            .finally(() => setSyncing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleSendUserInfo = async () => {
        if(isPending) return;
        setShowLoader(true);
        try {
            await submitPreference(onboardingInfo);
            sessionStorage.setItem("sm:justOnboarded", "1");
            await user!.reload();
            navigate('/dashboard');
        } catch (err) {
            setShowLoader(false);
            console.error('Error submitting preferences:', err);
        }
    }

    const handleSubmit = async () => {
        if(step<=4){
            if(!latestStepSelection){
                setShowMessageModal(true);
                return;
            }

            setOnboardingInfo((prev) => ({
                ...prev,

                selections: [
                    ...prev.selections,

                    {
                        title: latestStepSelection.title,
                        selection: latestStepSelection.selection,
                    },
                ],
            }));
        }
        else if(step===5){
            if(selectedInterests.length===0){
                setShowMessageModal(true);
                return;
            }

            setOnboardingInfo((prev) => ({
                ...prev,

                interests: selectedInterests
            }));
        }
        else if(step>5){
            await handleSendUserInfo();
            return;
        }

        setStep((prev) => prev + 1);
        setLatestStepSelection(undefined);
    };

    if (syncing) return <LoadingScreen loading={true} />;

    return (
        <>
            <title>On Boarding</title>

            <main className="min-h-[100dvh] bg-light-cream p-2">
                <section className="py-4 px-2.5 lg:px-5 w-full min-h-[calc(100dvh-16px)] rounded-4xl bg-white flex flex-col">
                    <Logo subtitle="Learn. Focus. Achieve" />

                    <div className="flex flex-1 min-h-0">
                        <div className="flex flex-col items-center flex-1 min-h-0 w-full lg:w-1/2">

                            <div className="flex-1 min-h-0 overflow-y-auto w-full">
                                <AnimatePresence mode="wait">
                                    {step < 5
                                        ? (
                                            <StepForm
                                                id={step+1}
                                                key={onboardingSteps[step].id}
                                                title={onboardingSteps[step].title}
                                                highlight={onboardingSteps[step].highlight}
                                                description={onboardingSteps[step].description}
                                                options={onboardingSteps[step].options}
                                                finalQuestion={onboardingSteps[step].finalQuestion}
                                                setLatestStepSelection={setLatestStepSelection}
                                            />
                                        ) : step === 5 ?(
                                            <InterestsForm key="interests-form" selectedInterests={selectedInterests} setSelectedInterests={setSelectedInterests} />
                                        ): step > 5 ?(
                                            <FinalOnboardingScreen onboardingInfo={onboardingInfo} />
                                        ): ''
                                    }
                                </AnimatePresence>
                            </div>

                            <div className="shrink-0 flex flex-col items-center w-full pb-4 pt-3 gap-3">
                                <p className="text-laurel-green text-xs tracking-wide opacity-70">You can always change these in settings</p>

                                <button
                                    onClick={()=>{
                                        if(step>6) return;
                                        handleSubmit();
                                    }}
                                    className="flex min-h-13 w-[90%] lg:w-[60%] items-center justify-between rounded-2xl bg-deep-bluish px-6 text-base font-semibold text-white shadow-[0_10px_30px_rgba(13,58,53,0.2)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] cursor-pointer">
                                    <span>Continue</span>

                                    <div className="flex h-7 lg:h-9 w-7 lg:w-9 items-center justify-center rounded-full bg-white/15">
                                        <ArrowRight size={18} className="text-white" />
                                    </div>
                                </button>

                                <ProgressBar step={step} totalSteps={6} />
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center justify-center w-1/2">
                            <img src="/image-5.png" alt="Student learning illustration" className="w-[80%] object-cover" />
                        </div>
                    </div>
                </section>
            </main>


            <MessageModal
                show={showMessageModal}
                setShow={setShowMessageModal}
                message="Please select an option before continuing."
            />

            <LoadingScreen loading={showLoader} />
        </>
    );
};



type ProgressProps = {
  step: number;
  totalSteps: number;
};

const ProgressBar = ({ step, totalSteps }: ProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-2 w-full">
        {Array.from({ length: totalSteps }).map((_, index) => {
            const active = index <= step-1;

            return (
                <div
                    key={index}
                    className={`
                        h-1.5 rounded-full transition-all duration-500 ease-in-out
                        ${active
                            ? "bg-moderate-green w-10"
                            : "bg-laurel-green/20 w-7"
                        }
                    `}
                />
            );
        })}
    </div>
  );
};
