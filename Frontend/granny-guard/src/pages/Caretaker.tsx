import Greeter from '@/components/Greeter.tsx';
import HealthMetrics from '@/components/HealthMetrics.tsx';
import ReminderList from '@/components/ReminderList.tsx';
import Pictures from '@/components/Pictures.tsx';
import Map from '@/components/Map.tsx';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function Caretaker() {
    return (
        <div className="bg-slate-100 h-screen w-screen p-4">
            <div className="grid grid-cols-2 grid-rows-[1fr_1.2fr] gap-4 h-full">

                {/* Top-Left: Greeter + Health Metrics */}
                <Card className="bg-white shadow-lg rounded-xl p-3 flex flex-col justify-between">
                    <CardHeader className="text-3xl font-bold text-slate-800 text-center">
                        <Greeter type="caretaker" />
                    </CardHeader>
                    <CardContent>
                        <HealthMetrics />
                    </CardContent>
                </Card>

                {/* Top-Right: Family Photos */}
                <Card className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center justify-start">
                    <CardHeader className="text-2xl font-semibold text-slate-800 text-center w-full mb-2">
                        Family Photos
                    </CardHeader>
                    <CardContent className="flex justify-center w-full">
                        <Pictures type="caretaker" />
                    </CardContent>
                </Card>

                {/* Bottom-Left: Reminders Notecard */}
                <div className="relative bg-white shadow-md rounded-lg border border-gray-300 overflow-y-auto">
                    <div className="ms-6 my-3">
                        <h2 className="text-2xl font-semibold text-slate-800">Reminders</h2>
                    </div>
                    {/* Red margin line */}
                    <div className="h-4 border-b-4 border-red-500"></div>
                    {/* Ruled paper background */}
                    <div
                        className="
              bg-[repeating-linear-gradient(
                white,
                white 27px,
                #cfe2ff 27px,
                #cfe2ff 28px
              )]
              px-6
              pt-8
              pb-4
              flex
              flex-col
              space-y-6
            "
                    >
                        <ReminderList type="caretaker" />
                    </div>
                </div>

                {/* Bottom-Right: Location Map */}
                <Card className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center overflow-hidden">
                    <CardHeader className="text-2xl font-semibold text-slate-800 text-center w-full mb-2">
                        Location Map
                    </CardHeader>
                    <CardContent className="flex justify-center w-full">
                        <Map x={192} y={195} />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

export default Caretaker;
