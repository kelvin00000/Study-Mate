import { GraduationCap, Calendar, CalendarDays, Timer, ChartBar, Sparkles } from "lucide-react";


type Props = {
    onboardingInfo: {selections: {title:string, selection:string}[], interests:string[]}
};

const FinalOnboardingScreen = ({ onboardingInfo }: Props) => {
    const icons = [GraduationCap, Calendar, ChartBar, Timer, CalendarDays];

    return (
        <div className="flex flex-col items-center w-full px-2">
            <h1 className="mt-4 text-2xl sm:text-3xl font-bold leading-snug text-deep-bluish">
                <span className="text-moderate-green">Almost there</span>
            </h1>
            <p className="max-w-md text-sm text-laurel-green text-center mt-1">Review your preferences before we personalize your experience</p>

            <div className="flex flex-col w-full mt-5 rounded-xl border border-laurel-green/20 divide-y divide-laurel-green/10 overflow-hidden">
                {onboardingInfo.selections.map((option, index) => {
                    const Icon = icons[index] || CalendarDays;
                    return (
                        <div key={index} className="flex items-center gap-4 px-4 py-3">
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-moderate-green/10 flex items-center justify-center">
                                <Icon size={18} className="text-moderate-green" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-xs text-laurel-green">{option.title}</span>
                                <span className="block text-sm font-bold text-deep-bluish truncate">{option.selection}</span>
                            </div>
                        </div>
                    );
                })}

                <div className="flex items-start gap-4 px-4 py-3">
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-moderate-green/10 flex items-center justify-center mt-0.5">
                        <Sparkles size={18} className="text-moderate-green" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="text-xs text-laurel-green">Interests</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {onboardingInfo.interests.map((interest, i) => (
                                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-moderate-green/10 text-deep-bluish font-medium">{interest}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalOnboardingScreen;
