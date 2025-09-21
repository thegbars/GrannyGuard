type ReminderProps = {
    title: string;
    time?: string;
    date?: string;
    type?: "urgent" | "normal";
};

const Reminder = ({ title, time, date, type }: ReminderProps) => {
    const isUrgent = type === "urgent";
    const color = isUrgent ? "text-red-600" : "text-black";

    return (
    <div className={`text-lg ${color}`}>
      <p className="font-bold">{title}</p>
      {(time || date) && <p>{time} • {date}</p>}
    </div>
    );
};

export default Reminder;
