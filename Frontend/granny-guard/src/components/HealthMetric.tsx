import {
    TriangleAlert,
    HeartPulse,
    Droplets,
    Thermometer,
    Activity,
} from "lucide-react";

type HealthMetricProps = {
    type?: "Warning" | "Urgent";
    text?: string;
    metric?: "heart rate" | "blood sugar" | "temperature" | "activity";
};

const iconMap = {
    "heart rate": HeartPulse,
    "blood sugar": Droplets,
    "temperature": Thermometer,
    "activity": Activity,
};

const HealthMetric = ({ type, text = "METRIC", metric }: HealthMetricProps) => {
    const bg =
        type === "Urgent" ? "bg-red-700" :
            type === "Warning" ? "bg-yellow-400" :
                "bg-white";

    const Icon = metric ? iconMap[metric] ?? TriangleAlert : TriangleAlert;

    return (
        <div className={`border-3 border-black px-5 rounded-md flex items-center gap-1 ${bg}`}>
            <Icon className="w-16 h-16 text-white" />
            <p className="text-[80px] text-white">{text}</p>
        </div>
    );
};

export default HealthMetric;
