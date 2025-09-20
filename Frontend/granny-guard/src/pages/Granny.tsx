import Greeter from '@/components/Greeter.tsx';
import HealthMetrics from '@/components/HealthMetrics.tsx';
import ReminderList from '@/components/ReminderList.tsx';
import Pictures from '@/components/Pictures';


import { Separator } from "@/components/ui/separator"


function Granny() {
    return (
        <div className="grid grid-cols-2 grid-rows-2 h-screen w-screen bg-slate-200">
            <div className="">
                <div className="my-2">
                    <Greeter />
                    <Separator className="bg-black mb-2 "/>
                    <HealthMetrics />
                </div>

            </div>
            <div className="flex items-center justify-center bg-green-100">
                <Pictures />
            </div>
            <div className="flex bg-blue-100">
                <ReminderList />
            </div>
            <div className="flex items-center justify-center bg-yellow-100">
                Map
            </div>
        </div>
    )
}

export default Granny
