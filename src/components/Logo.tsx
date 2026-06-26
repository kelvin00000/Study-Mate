

type props = {
    subtitle: string;
}

export default function Logo({ subtitle }: props){
    return(
        <div className="inline-block font-normal">
            <div className="flex gap-3">
                <img src="/logo.png" alt="StudyMate logo" className="w-12 h-12 rounded-[12px]" />

                <div className="flex flex-col">
                    <span className="font-bold">Study Mate</span>
                    <span className="text-sm">{subtitle}</span>
                </div>
            </div>
        </div>
    )
}
