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
            className="w-full h-[90%] font-normal"
        >
            <p className="mt-[10px] text-moderate-green font-semibold"> Step {id} of 6 </p>

            <h1 className="text-4xl lg:text-3xl font-bold leading-tight text-deep-bluish">
                {title}
                <span className="block lg:inline-block lg:ml-2.5 text-moderate-green">{highlight}</span>
            </h1>

            <p className="max-w-md text-laurel-green">{ description }</p>

            <div className="flex flex-col items-center mt-5 space-y-4 lg:space-y-2">
                {options.map((option) => (
                    <label
                        key={option.title}
                        className="flex lg:h-[50px] lg:w-[80%] w-full cursor-pointer items-center justify-between rounded-2xl lg:rounded-[10px] border border-laurel-green/30 bg-light-cream p-3 lg:p-2 text-left transition hover:border-moderate-green"
                    >
                        <div>
                            <h3 className="font-bold text-[19px] lg:text-[15px] text-deep-bluish">{option.title}</h3>
                            <p className="mt-1.5 mb-1 text-[14px] leading-0 text-laurel-green">{option.subtitle}</p>
                        </div>

                        <div className="relative flex items-center justify-center">
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

                            <div className="mr-2.5 h-4 w-4 rounded-full border-2 border-moderate-green transition-all peer-checked:border-[6px]" />
                        </div>
                    </label>
                ))}
            </div>
        </motion.div>
    );
};

export default StepForm;
