import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Logo from "../../../components/Logo";
import { onboardingSteps } from "./Onboardingdata";
import StepForm from "./StepForm";
import InterestsForm from "./InterestForm";
import FinalOnboardingScreen from "./FinalOnboardingScreen";
import MessageModal from "../../../components/Modal";
import LoadingScreen from "../../../components/LoadingScreen";


// type props = {
//     setOnboardingInfo: React.Dispatch<React.SetStateAction<{selections: {title:string, selection:string}[], interests:string[]}>>
//     onboardingInfo: {selections: {title:string, selection:string}[], interests:string[]}
// };

export default function OnboardingPage() {
    const { getToken } = useAuth()
    const token = getToken()
    const [ step, setStep ] = useState(0);
    const [ onboardingInfo, setOnboardingInfo ] = useState<{selections: {title:string, selection:string}[], interests:string[]}>({selections:[], interests:[]})
    const [ latestStepSelection, setLatestStepSelection ] = useState<{title:string, selection:string}>()
    const [ selectedInterests, setSelectedInterests ] = useState<string[]>([])
    const [ showMessageModal, setShowMessageModal ] = useState(false)
    const [ showLoader, setShowLoader ] = useState(false)


    const handleSendUserInfo = async () => {
        setShowLoader(true);
        try {
            await fetch('https://studymate-backend-dhnt.onrender.com/user/onboarding', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...onboardingInfo }),
            })

            setShowLoader(false);
        }
        catch (error) {
            console.error(error);
            setShowLoader(false);
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
            // CALL ENDPOINT SEND FUNC
            await handleSendUserInfo();
        }

        setStep((prev) => prev + 1);
        setLatestStepSelection(undefined);
    };

    return (
        <>
            <title>On Boarding</title>

            <main className="h-screen bg-(--bg) p-2">
                <section className="py-4 px-2.5 lg:px-5 w-full h-full rounded-[32px] bg-(--card)">
                    <Logo subtitle="Learn. Focus. Achieve" />

                    <div className="flex items-center h-[94%]">
                        <div className="flex flex-col items-center h-full w-full lg:w-1/2">

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

                            <div className="m-0 text-(--muted) text-[14px]">*You can always change these in settings*</div>

                            <button
                                onClick={()=>{
                                    if(step>6) return;
                                    handleSubmit();
                                }}
                                className="mt-3 lg:mt-4 flex min-h-[55px] w-[90%] lg:w-[60%] items-center justify-between rounded-2xl bg-(--purple-primary) px-6 text-lg font-semibold text-white shadow-[0_10px_30px_rgba(125,74,244,0.25)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] cursor-pointer">
                                <span>Continue</span>

                                <div className="flex h-7 lg:h-9 w-7 lg:w-9 items-center justify-center rounded-full bg-white">
                                    <ArrowRight size={20} className="text-(--purple-primary)" />
                                </div>
                            </button>

                            <ProgressBar step={step} totalSteps={6} />
                        </div>

                        <div className="hidden lg:flex items-center justify-center w-1/2 h-full">
                            <img src="/image-5.png" className="w-[80%] object-cover" />
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
    <div className="mt-4 flex items-center justify-center gap-3 w-full">
        {Array.from({ length: totalSteps }).map((_, index) => {
            const active = index <= step-1;

            return (
                <div
                    key={index}
                    className={`
                        h-2 w-10 rounded-full transition-all duration-500 ease-in-out
                        ${active
                            ? "bg-(--purple-primary)"
                            : "bg-[#DDD6FE]"
                        }
                    `}
                />
            );
        })}
    </div>
  );
};
