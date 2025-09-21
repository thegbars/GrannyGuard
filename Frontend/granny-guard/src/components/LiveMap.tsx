import { useEffect, useMemo, useState } from "react";
import Map from "./Map";

type GrannyLocation = {
  x: number | null;
  y: number | null;
  source_cam?: string | null;
  updated_at?: string | null;
};

type ItemLocations = {
  item: string;
  x: number;
  y: number;
  source_cam?: string | null;
  conf?: number | null;
  updated_at?: string | null;
};

const ICONS: Record<string, string> = {
  granny: "/person.svg",
  wallet: "/wallet.svg",
  keys: "/keys.svg",
  sunglasses: "/sunglasses.svg",
  pill_bottle: "/pill_bottle.svg",
  alegra: "/alegra.svg",
  item: "/wallet.svg", 
};

const WORLD = { xMin: 0, xMax: 192, yMin: 0, yMax: 255 };
const BACKEND = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function LiveMap() {
  const [granny, setGranny] = useState<GrannyLocation | null>(null);
  const [items, setItems] = useState<ItemLocations[]>([]);

  async function loadOnce() {
    try {
      const [granny_stuff, items_stuff] = await Promise.all([
        fetch(`${BACKEND}/location/granny`),
        fetch(`${BACKEND}/locations/items`),
      ]);
      const grandmama = (await granny_stuff.json()) as GrannyLocation;
      const items_locations = (await items_stuff.json()) as ItemLocations[];
      setGranny(grandmama);
      setItems(Array.isArray(items_locations) ? items_locations : []);
    } catch (e) {
      console.warn("missue w/ getting map", e);
    }
  }

  useEffect(() => {
    loadOnce();
    const id = setInterval(loadOnce, 2000);
    return () => clearInterval(id);
  }, []);

  const overlays = useMemo(() => {
    const o: { x: number; y: number; src: string; size?: number; key?: string }[] = [];

    // my grandmother
    if (granny?.x != null && granny?.y != null) {
      o.push({
        x: granny.x,
        y: granny.y,
        src: "/person.svg",
        size: 28,
        key: "granny",
      });
    }

    // goods
    for (const it of items) {
      if (it?.x == null || it?.y == null) continue;
      const icon = ICONS[it.item?.toLowerCase?.()] ?? ICONS.item;
      o.push({
        x: it.x,
        y: it.y,
        src: icon,
        size: 22,
        key: `item-${it.item}`,
      });
    }

    return o;
  }, [granny, items]);

  return (
    <Map
      overlays={overlays}
      width={600}
      height={750}
      className="rounded-md shadow"
      worldBounds={WORLD}
    />
  );
}
