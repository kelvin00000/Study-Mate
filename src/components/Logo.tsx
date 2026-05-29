

type props = {
    subtitle: string;
}

export default function Logo({ subtitle }: props){
    return(
        <div className="inline-block">
            <div className="flex gap-3">
                <img src="/logo.png" className="w-10 h-10 rounded-[10px]" />

                <div className="flex flex-col">
                    <span className="font-bold">Study Mate</span>
                    <span className="text-sm">{subtitle}</span>
                </div>
            </div>
        </div>
    )
}
