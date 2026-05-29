import { GraduationCap, Calendar, CalendarDays, Timer, ChartBar, Sparkles } from "lucide-react";


type Props = {
    onboardingInfo: {selections: {title:string, selection:string}[], interests:string[]}
};

const FinalOnboardingScreen = ({ onboardingInfo }: Props) => {
    let dummyKey = 1;

    return (
        <>
            <div className="flex flex-col items-center h-[90%]">
                <h1 className="mt-[20px] text-4xl lg: font-bold leading-tight text-(--text-primary)">
                    <span className="block lg:inline-block lg:ml-2.5 text-(--purple-accent)">Almost There</span>
                </h1>
                <p className="max-w-md text-(--text-secondary) text-center">Review Your preferences before we can personalize your experience</p>

                <div className="flex flex-col items-center mt-10 lg:mt-5 p-3 w-full m-h-[80%] rounded-[20px] border border-gray-300">
                    {onboardingInfo.selections.map((option, index) => (
                        <div key={dummyKey++} className="flex items-center px-2 mt-3 lg:mt-0 w-full">
                            {index===0?<GraduationCap size={30} className="mr-12 text-(--purple-primary)" />
                                :index===1?<Calendar size={30} className="mr-12 text-(--purple-primary)" />
                                :index===2?<ChartBar size={30} className="mr-12 text-(--purple-primary)" />
                                :index===3?<Timer size={30} className="mr-12 text-(--purple-primary)" />
                                :<CalendarDays size={30} className="mr-12 text-(--purple-primary)" />
                            }

                            <div className="flex flex-col">
                                <span className="text-sm text-(--text-secondary)">{option.title}</span>
                                <span className="text-[18px] font-bold">{option.selection}</span>
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center px-2 mt-3 w-full">
                        <Sparkles size={30} className="mr-12 text-(--purple-primary)" />

                        <div className="flex flex-col w-full">
                            <span className="text-(--text-secondary)">Interests</span>
                            <div className="flex flex-wrap gap-2 items-start w-full h-[120px] lg:h-[20px] overflow-y-scroll overflow-x-hidden no-scrollbar">
                                {onboardingInfo.interests.map((interest)=>(
                                    <span key={dummyKey++} className="">{interest}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinalOnboardingScreen;
