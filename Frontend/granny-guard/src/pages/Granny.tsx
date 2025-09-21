import Greeter from '@/components/Greeter.tsx';
import HealthMetrics from '@/components/HealthMetrics.tsx';
import ReminderList from '@/components/ReminderList.tsx';
import Pictures from '@/components/Pictures.tsx';
import Map from '@/components/Map.tsx';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function Granny() {

    const overlays = [
        { x: 192, y: 195, src: "/old-woman.png", key: "granny" },
        { x: 120, y: 220, src: "/pill-icon.png", size: 20, key: "pills" },
        { x: 50, y: 100, src: "/keys-icon.png", key: "keys" },
    ];

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
                <Card className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center">
                    <CardHeader className="text-2xl font-semibold text-slate-800 text-center w-full mb-2">
                        Family Photos
                    </CardHeader>
                    <CardContent className="flex justify-center w-full">
                        <Pictures type="granny" />
                    </CardContent>
                </Card>

                {/* Bottom-Left: Reminders Notecard */}
                <div className="relative bg-white shadow-md rounded-lg border border-gray-300 overflow-y-auto">
                    {/* Floating title */}
                    <div className="ms-6 my-3">
                        <h2 className="text-2xl font-semibold text-slate-800">Reminders</h2>
                    </div>
                    {/* Red margin line */}
                    <div className="h-4 border-b-4 border-red-500"></div>
                    <div
                        className="
              px-6
              pt-8
              pb-4
              flex
              flex-col
              space-y-6
            "
                    >
                        <ReminderList type="granny" />
                    </div>
                </div>

                {/* Bottom-Right */}
                <Card className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center overflow-hidden">
                    <CardHeader className="text-2xl font-semibold text-slate-800 text-center w-full mb-2">
                        Location Map
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Map
                            overlays={overlays}
                            width={200}
                            height={250}
                            className="max-w-[200px] max-h-[250px] w-full h-auto"
                        />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

export default Granny;
