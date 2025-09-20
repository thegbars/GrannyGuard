import { TriangleAlert } from "lucide-react"

const HealthMetric = () => {
    return (
        <div className="border-3 border-solid border-black px-2 rounded-md flex flex-row gap-1 items-center">
            <TriangleAlert className="w-16 h-16"/>
            <p className="text-[80px]">METRIC</p>
        </div>
    );
};

export default HealthMetric;