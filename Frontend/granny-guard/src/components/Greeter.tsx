import { useEffect, useMemo, useState } from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

type GreeterProps = { type: "granny" | "caretaker" };

type TimePayload = {
  iso: string;
  date: string;
  time_24h: string;
  time_12h: string;
  weekday: string;
  timezone: string;
  icon: string;
};

const iconMap = {
  sunrise: Sunrise,
  sun: Sun,
  sunset: Sunset,
  moon: Moon,
} as const;

const ordinal = (n: number) =>
  n % 10 === 1 && n % 100 !== 11 ? "st"
: n % 10 === 2 && n % 100 !== 12 ? "nd"
: n % 10 === 3 && n % 100 !== 13 ? "rd"
: "th";

export default function Greeter({ type }: GreeterProps) {
  const [time, setTime] = useState<TimePayload | null>(null);

  useEffect(() => {
    const backend = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
    const tick = async () => {
      try {
        const r = await fetch(`${backend}/time`);
        const data: TimePayload = await r.json();
        setTime(data);
      } catch {
        const now = new Date();
        const hour = now.getHours();
        const icon =
          hour >= 5 && hour < 7 ? "sunrise" :
          hour >= 7 && hour < 18 ? "sun" :
          hour >= 18 && hour < 20 ? "sunset" : "moon";
        setTime({
          iso: now.toISOString(),
          date: now.toISOString().slice(0, 10),
          time_24h: now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" }),
          time_12h: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          weekday: now.toLocaleDateString([], { weekday: "long" }),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          icon,
        });
      }
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const Icon = useMemo(() => {
    const key = (time?.icon ?? "sun").toLowerCase() as keyof typeof iconMap;
    return iconMap[key] ?? Sun;
  }, [time]);

  const hour = time ? new Date(time.iso).getHours() : new Date().getHours();
  const prefix = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greeting = type === "granny" ? `${prefix}, Eileen` : "Inside of Eileen's life";

  const prettyDate = useMemo(() => {
    if (!time) return "";
    const d = new Date(time.iso);
    const month = d.toLocaleDateString(undefined, { month: "long" });
    const day = d.getDate();
    return `${time.weekday}, ${month} ${day}${ordinal(day)}`;
  }, [time]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center space-x-2">
        <Icon className="w-8 h-8" />
        <p className="lobster-regular text-[40px]">{greeting}</p>
      </div>
      <div className="flex gap-2">
        <p className="lobster-regular text-[30px]">{prettyDate}</p>
        <p className="lobster-regular text-[30px]">{time?.time_12h ?? ""}</p>
      </div>
    </div>
  );
}