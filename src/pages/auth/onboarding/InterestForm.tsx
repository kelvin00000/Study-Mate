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
            className="flex flex-col mt-5 font-normal h-[90%]"
        >
            <span className="mt-2.5 h-[4%] text-moderate-green font-semibold leading-5">Step 6 of 6</span>
            <p className="lg:mb-[30px] h-[10%] text-3xl font-bold leading-10 text-deep-bluish">What are your interests?</p>


            <div className="flex items-center justify-center gap-4 h-[20%] w-full px-3">
                <input
                    type="text"
                    placeholder="Add New Interest"
                    value={inputText}
                    ref={inputTextRef}
                    onInput={()=>{ setInputText(inputTextRef.current?.value||"") }}
                    className="h-[55px] w-[80%] border-2 border-laurel-green rounded-[20px] text-[19px] text-center text-deep-bluish outline-none focus:outline-none focus:border-moderate-green autofill:bg-transparent transition-colors"
                />

                <button
                    onClick={()=>{ setinterestArr((prev)=>([...prev, inputText ])) }}
                    className="flex items-center justify-center h-[55px] w-[70px] rounded-2xl bg-moderate-green text-lg font-semibold text-white cursor-pointer transition hover:opacity-90"
                >
                    Add
                </button>
            </div>

            <div className="pt-2.5 px-1 h-[70%] lg:h-[50%] rounded-[20px] overflow-y-scroll overflow-x-hidden no-scrollbar bg-light-cream">
                {interestArr.map((interest) => {
                    const selected = selectedInterests.includes(interest)

                    return(
                        <button
                            key={crypto.randomUUID()}
                            onClick={()=>{ handleInterestSelect(interest) }}
                            className={`relative rounded-xl m-1 border bg-white px-5 py-3 text-sm font-medium cursor-pointer transition ${selected? "border-moderate-green bg-moderate-green/10 text-deep-bluish" : "border-laurel-green/30 text-deep-bluish"}`}
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
                                        absolute -right-2 -top-2
                                        flex h-6 w-6 items-center justify-center
                                        rounded-full bg-moderate-green
                                        text-xs text-white
                                    "
                                >
                                    x
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </motion.div>
    );
};

export default InterestsForm;
