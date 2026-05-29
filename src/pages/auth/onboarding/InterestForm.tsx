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
            className="flex flex-col mt-5 font-(--font-normal) h-[90%]"
        >
            <span className="mt-2.5 h-[4%] text-(--purple-primary) font-semibold leading-5">Step 6 of 6</span>
            <p className="lg:mb-[30px] h-[10%] text-3xl font-bold leading-10 text-(--text-primary)">What are your interests?</p>


            <div className="flex items-center justify-center gap-4 h-[20%] w-full px-3">
                <input
                    type="text"
                    placeholder="Add New Interest"
                    value={inputText}
                    ref={inputTextRef}
                    onInput={()=>{ setInputText(inputTextRef.current?.value||"") }}
                    className="h-[55px] w-[80%] border-2 border-gray-600 rounded-[20px] text-[19px] text-center outline-none focus:outline-none autofill:bg-transparent"
                />

                <button
                    onClick={()=>{ setinterestArr((prev)=>([...prev, inputText ])) }}
                    className="flex items-center justify-center h-[55px] w-[70px] rounded-2xl bg-(--purple-primary) text-lg font-semibold text-white"
                >
                    Add
                </button>
            </div>

            <div className="pt-2.5 px-1 h-[70%] lg:h-[50%] rounded-[20px] overflow-y-scroll overflow-x-hidden no-scrollbar bg-gray-100">
                {interestArr.map((interest) => {
                    const selected = selectedInterests.includes(interest)

                    return(
                        <button
                            key={crypto.randomUUID()}
                            onClick={()=>{ handleInterestSelect(interest) }}
                            className={`relative rounded-xl m-1 border border-[var(--border)] bg-white px-5 py-3 text-sm font-medium cursor-pointer ${selected? "border-[var(--purple-accent)] bg-[var(--purple-accent)]/10" : "border-[var(--border)]"}`}
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
                                        rounded-full bg-(--purple-primary)
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
