type ReminderProps = {
    title: string;
    time?: string;
    date?: string;
    type?: string; // now just a string
};

const Reminder = ({ title, time, date, type }: ReminderProps) => {
    const isUrgent = type === "urgent";
    const color = isUrgent ? "text-red-600" : "text-black";

    return (
        <div className={`text-lg ${color}`}>
            <p className="font-bold">{title}</p>
            <p>{time} • {date}</p>
        </div>
    );
};

export default Reminder;
