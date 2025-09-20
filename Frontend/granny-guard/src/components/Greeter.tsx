import { Sun } from "lucide-react"

const Greeter = () => {
    return (
        <div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                    <Sun className="w-18 h-18" />
                    <p className="lobster-regular text-[40px]">Good Morning, Eileen</p>
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