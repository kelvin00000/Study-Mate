import { motion } from "framer-motion";
import { useRef, useState } from "react";

type props = {
    selectedInterests: string[],
    setSelectedInterests: React.Dispatch<React.SetStateAction<string[]>>
}

const InterestsForm = ({ selectedInterests, setSelectedInterests} : props) => {
    const [ interestArr, setinterestArr ] = useState<string[]>(["Football", "Basketball", "Baseball", "Tennis", "Swimming",
    "Music", "Dance", "Gaming", "Anime", "Formula 1", "Movies & TV",
    "Fashion", "Cooking", "Photography", "Travel", "Fitness",
    "Reading", "Art & Design", "Technology", "Nature & Hiking", "Cars"])
    const [ inputText, setInputText ] = useState("");
    const inputTextRef = useRef<HTMLInputElement>(null);


    const handleInterestSelect = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest)
            ? prev.filter((item) => item !== interest)
            : [...prev, interest]
        );
    }


    return (
        <motion.div
            key={100}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col font-normal px-2 flex-1 min-h-0"
        >
            <p className="mt-2 text-moderate-green text-sm font-semibold tracking-wide">Step 6 of 6</p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug text-deep-bluish mt-1 mb-4">What are your interests?</h1>

            <div className="flex items-center gap-3 w-full mb-3">
                <input
                    type="text"
                    placeholder="Add new interest"
                    value={inputText}
                    ref={inputTextRef}
                    onInput={()=>{ setInputText(inputTextRef.current?.value||"") }}
                    className="h-11 flex-1 border border-laurel-green/40 rounded-xl text-sm px-4 text-deep-bluish outline-none focus:outline-none focus:border-moderate-green autofill:bg-transparent transition-colors"
                />

                <button
                    onClick={()=>{ setinterestArr((prev)=>([...prev, inputText ])) }}
                    className="flex items-center justify-center h-11 px-5 rounded-xl bg-moderate-green text-sm font-semibold text-white cursor-pointer transition hover:opacity-90"
                >
                    Add
                </button>
            </div>

            <div className="flex-1 min-h-0 p-3 sm:p-4 rounded-xl overflow-y-auto no-scrollbar bg-light-cream">
                <div className="flex flex-wrap gap-2 content-start">
                    {interestArr.map((interest) => {
                        const selected = selectedInterests.includes(interest)

                        return(
                            <button
                                key={interest}
                                onClick={()=>{ handleInterestSelect(interest) }}
                                className={`relative rounded-lg border bg-white px-4 py-2 text-sm font-medium cursor-pointer transition ${selected? "border-moderate-green bg-moderate-green/10 text-deep-bluish" : "border-laurel-green/30 text-deep-bluish"}`}
                            >
                                {interest}

                                {selected && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            setSelectedInterests((prev) =>
                                                prev.filter((item) => item !== interest)
                                            );
                                        }}
                                        className="
                                            absolute -right-1.5 -top-1.5
                                            flex h-5 w-5 items-center justify-center
                                            rounded-full bg-moderate-green
                                            text-[10px] text-white
                                        "
                                    >
                                        x
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default InterestsForm;
