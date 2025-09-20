import HealthMetric from './HealthMetric.tsx';

const HealthMetrics = () => {
    return (
        <div className="flex flex-row gap-2 justify-center">
            <HealthMetric type="Warning" text="72" metric="heart rate"/>
            <HealthMetric type="Urgent" text="104" metric="blood sugar"/>
        </div>
    );
};

export default HealthMetrics;