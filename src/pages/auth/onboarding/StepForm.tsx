import { motion } from "framer-motion";

type Option = {
    title: string;
    subtitle: string;
};

type Props = {
    id: number
    title: string;
    highlight: string;
    description: string;
    options: Option[];
    finalQuestion: string
    setLatestStepSelection: React.Dispatch<React.SetStateAction<{title:string, selection:string}|undefined>>
};

const StepForm = ({ id, title, highlight, description, options, finalQuestion, setLatestStepSelection }: Props) => {
    return (
        <motion.div
            key={id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full font-normal px-2"
        >
            <p className="mt-2 text-moderate-green text-sm font-semibold tracking-wide">Step {id} of 6</p>

            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold leading-snug text-deep-bluish mt-1">
                {title}
                <span className="block sm:inline-block sm:ml-2 text-moderate-green">{highlight}</span>
            </h1>

            <p className="max-w-md text-sm text-laurel-green mt-1">{ description }</p>

            <div className="flex flex-col items-center mt-4 space-y-2.5 lg:space-y-2">
                {options.map((option) => (
                    <label
                        key={option.title}
                        className="flex lg:w-[80%] w-full cursor-pointer items-center justify-between rounded-xl border border-laurel-green/30 bg-light-cream px-4 py-3 lg:py-2.5 text-left transition hover:border-moderate-green"
                    >
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-[15px] text-deep-bluish">{option.title}</h3>
                            <p className="text-xs text-laurel-green mt-0.5 leading-snug">{option.subtitle}</p>
                        </div>

                        <div className="relative flex items-center justify-center shrink-0 ml-3">
                            <input
                                onInput={()=>{
                                    setLatestStepSelection({
                                        title: finalQuestion,
                                        selection: option.title
                                    })
                                }}
                                type="radio"
                                name="education-level"
                                value={option.title}
                                className="peer absolute h-full w-full cursor-pointer opacity-0"
                            />

                            <div className="mr-1 h-4 w-4 rounded-full border-2 border-laurel-green/40 transition-all peer-checked:border-moderate-green peer-checked:border-[5px]" />
                        </div>
                    </label>
                ))}
            </div>
        </motion.div>
    );
};

export default StepForm;
