import { useEffect, useMemo, useState } from "react";
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

// const reminders = [
    // { title: "Take meds", time: "8:00 AM", date: "Sept 21", type: "urgent" },
    // { title: "Call Grandma", time: "12:00 PM", date: "Sept 22", type: "normal" },
    // { title: "Check glucose", time: "6:00 PM", date: "Sept 23", type: "urgent" },
// ];
type BackendReminders = {
    id: number;
    text: string;
    due_at?: string | null;
    created_at: string;
    urgency?: "urgent" | "normal";
};

const format_date = (iso?: string | null) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const format_time = (iso?: string | null) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

function isolate_local(dateStr: string, timeStr: string): string | undefined {
    if (!dateStr || !timeStr) return undefined;
    const d = new Date(`${dateStr} ${timeStr}`);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
}

export default function ReminderList({ type }: ReminderListProps) {
    const [list, setList] = useState<BackendReminders[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [urgency, setUrgency] = useState<"urgent" | "normal">("normal");

    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
    const fetchReminders = async () => {
        try {
        setLoading(true);
        const r = await fetch(`${apiBase}/reminders`);
        const data: BackendReminders[] = await r.json();
        setList(data);
        setError(null);
        } catch (e) {
        setError("Failed to load reminders");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
        const id = setInterval(fetchReminders, 60_000);
        return () => clearInterval(id);
    }, []);

    const displayReminders = useMemo(
        () =>
        list
            .slice()
            .sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""))
            .map((r) => ({
            key: r.id,
            title: r.text,
            time: format_time(r.due_at),
            date: format_date(r.due_at),
            type: (r.urgency as "urgent" | "normal") ?? "normal",
            })),
        [list]
    );

    const handleSave = async () => {
        const due_at = isolate_local(date, time);
        if (!title.trim()) return;

        setSaving(true);
        try {
        const r = await fetch(`${apiBase}/reminders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: title.trim(), due_at, urgency }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const created: BackendReminders = await r.json();
        setList((prev) => [...prev, created]);
        setTitle(""); setTime(""); setDate("");
        setUrgency("normal");
        } catch {
        alert("Failed to save reminder");
        } finally {
        setSaving(false);
        }
    };

  return (
    <div>
      {loading && <p className="text-sm text-gray-500 mb-2">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {displayReminders.map((r, i) => (
        <div key={r.key ?? i}>
          <div className="flex justify-between items-center">
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
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="button"
                        variant={urgency === "normal" ? "default" : "outline"}
                        onClick={() => setUrgency("normal")}>
                  Normal
                </Button>
                <Button type="button"
                        variant={urgency === "urgent" ? "default" : "outline"}
                        onClick={() => setUrgency("urgent")}>
                  Urgent
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={saving || !title.trim()}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
