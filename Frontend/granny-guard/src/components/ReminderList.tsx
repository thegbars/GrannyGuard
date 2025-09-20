import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Reminder from "@/components/Reminder";

const reminders = [
    { title: "Take meds", time: "8:00 AM", date: "Sept 21", type: "urgent" },
    { title: "Call Grandma", time: "12:00 PM", date: "Sept 22", type: "normal" },
    { title: "Check glucose", time: "6:00 PM", date: "Sept 23", type: "urgent" },
];

const ReminderList = () => (
    <div className="p-6 ">
        <p className="text-2xl font-bold">Reminders</p>
        <Table>
            <TableHeader>
                <TableRow className="border-b border-black">
                    <TableHead className="text-lg"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reminders.map((r, i) => (
                    <TableRow key={i} className="border-b border-black">
                        <TableCell>
                            <Reminder {...r} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

export default ReminderList;
