import { Sun } from "lucide-react"

type GreeterProps = {
    type: "granny" | "caretaker";
};


const Greeter = ({ type }: GreeterProps) => {
    const greeting = type === "granny" ? "Good Morning, Eileen" : "Inside of Eileen's life"
    return (
        <div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                    <Sun className="w-18 h-18" />
                    <p className="lobster-regular text-[40px]">{greeting}</p>
                </div>
                <div className="flex gap-2">
                    <p className="lobster-regular text-[30px]">Saturday, September 20th </p>
                    <p className="lobster-regular text-[30px]">5:00pm</p>
                </div>
            </div>
        </div>
    );
};

export default Greeter;