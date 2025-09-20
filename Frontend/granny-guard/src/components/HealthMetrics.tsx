import HealthMetric from './HealthMetric.tsx';

const HealthMetrics = () => {
    return (
        <div className="flex flex-row gap-2 justify-center">
            <HealthMetric />
            <HealthMetric />
        </div>
    );
};

export default HealthMetrics;