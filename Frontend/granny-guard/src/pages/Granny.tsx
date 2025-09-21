import Greeter from '@/components/Greeter.tsx';
import HealthMetrics from '@/components/HealthMetrics.tsx';
import ReminderList from '@/components/ReminderList.tsx';
import Pictures from '@/components/Pictures.tsx';
import LiveMap from '@/components/LiveMap.tsx';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function Granny() {

    return (
        <div className="bg-slate-100 h-screen w-screen p-4">
            <div className="grid grid-cols-2 grid-rows-[1fr_1.2fr] gap-4 h-full">

                {/* Top-Left */}
                <Card className="bg-white shadow-lg rounded-xl p-3 flex flex-col justify-between">
                    <CardHeader className="text-3xl font-bold text-slate-800 text-center">
                        <Greeter type="granny" />
                    </CardHeader>
                    <CardContent>
                        <HealthMetrics />
                    </CardContent>
                </Card>

                {/* Top-Right */}
                <Card className="bg-white shadow-lg rounded-xl p-3">
                    <CardHeader className="text-2xl font-semibold text-slate-800">
                        Reminders
                    </CardHeader>
                    <CardContent>
                        <ReminderList type="granny"/>
                    </CardContent>
                </Card>

                {/* Bottom-Left */}
                <Card className="bg-white shadow-lg rounded-xl p-3">
                    <CardHeader className="text-2xl font-semibold text-slate-800">
                        Pictures
                    </CardHeader>
                    <CardContent>
                        <Pictures type="caretaker"/>
                    </CardContent>
                </Card>

                {/* Bottom-Right (LIVE MAP) */}
                <Card className="bg-white shadow-lg rounded-xl p-3 flex items-center justify-center">
                    <CardHeader className="text-2xl font-semibold text-slate-800">
                        Live Map
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <LiveMap />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

export default Granny;