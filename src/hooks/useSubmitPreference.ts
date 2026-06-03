import { useMutation } from "@tanstack/react-query"
import { apiCall } from "../api/apicall"
import { useAuth } from "@clerk/clerk-react"
import { onboardingSteps } from "../constants/Onboardingdata"

const getOptionIndex = (stepIndex: number, selection: string): number =>
    onboardingSteps[stepIndex].options.findIndex(o => o.title === selection) + 1;

export const useSubmitPreference = () => {
    const { getToken } = useAuth()
    return useMutation({
        mutationFn: async (data: { selections: { title: string, selection: string }[], interests: string[] }) => {
            const token = await getToken()

            const byTitle = Object.fromEntries(data.selections.map(s => [s.title, s.selection]));

            const educationLevel     = getOptionIndex(0, byTitle[onboardingSteps[0].finalQuestion] ?? '');
            const explanationDepth   = getOptionIndex(1, byTitle[onboardingSteps[1].finalQuestion] ?? '');
            const learningGoal       = byTitle[onboardingSteps[2].finalQuestion] ?? '';
            const studySessionDuration = getOptionIndex(3, byTitle[onboardingSteps[3].finalQuestion] ?? '');

            return apiCall('/user/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ educationLevel, explanationDepth, learningGoal, studySessionDuration, interests: data.interests }),
            })
        }
    })
}

export const useSyncUser = ()=>{
    const { getToken } = useAuth()
    return useMutation({
        mutationFn: async () => {
            const token = await getToken()
            return apiCall('/auth/sync', {
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${token}`,
                },
            })
        }
    })
}