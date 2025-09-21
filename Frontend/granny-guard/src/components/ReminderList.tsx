import { useState } from "react";
import Reminder from "@/components/Reminder";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ReminderListProps = {
    type: "granny" | "caretaker";
};

const reminders = [
    { title: "Take meds", time: "8:00 AM", date: "Sept 21", type: "urgent" },
    { title: "Call Grandma", time: "12:00 PM", date: "Sept 22", type: "normal" },
    { title: "Check glucose", time: "6:00 PM", date: "Sept 23", type: "urgent" },
];

export default function ReminderList({ type }: ReminderListProps) {
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");

    return (
        <div>
            {reminders.map((r, i) => (
                <div>
                    <div key={i} className="flex justify-between items-center">
                        <Reminder {...r} />
                    </div>
                    <div className="h-2 w-full mb-2 border-b-2 border-blue-500"></div>
                </div>
            ))}

            {type === "caretaker" && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="secondary"
                            className="w-full h-12 text-xl border-2 border-black rounded-md"
                        >
                            ＋ Add Reminder
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Reminder</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Input
                                placeholder="Time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                            <Input
                                placeholder="Date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    console.log({ title, time, date });
                                    setTitle("");
                                    setTime("");
                                    setDate("");
                                }}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
