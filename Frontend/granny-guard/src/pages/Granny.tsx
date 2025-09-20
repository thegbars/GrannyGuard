import Greeter from '../components/Greeter.tsx';
import HealthMetrics from '../components/HealthMetrics.tsx';
import { Separator } from "@/components/ui/separator"


function Granny() {
    return (
        <div className="grid grid-cols-2 grid-rows-2 h-screen w-screen bg-slate-200">
            <div className="">
                <div className="my-2 mx-2">
                    <Greeter />
                    <Separator className="bg-black mb-2 "/>
                    <HealthMetrics />
                </div>

            </div>
            <div className="flex items-center justify-center bg-green-100">
                Personalization
            </div>
            <div className="flex items-center justify-center bg-blue-100">
                Reminders
            </div>
            <div className="flex items-center justify-center bg-yellow-100">
                Map
            </div>
        </div>
    )
}

export default Granny
