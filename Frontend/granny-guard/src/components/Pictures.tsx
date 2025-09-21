import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type PicturesProps = { type: "granny" | "caretaker" };

export default function Pictures({ type }: PicturesProps) {
  const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${apiBase}/pictures`);
        const data: string[] = await r.json();
        setImages(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  useEffect(() => {
    if (!images.length) return;
    const id = setInterval(() => setIndex(i => (i + 1) % images.length), 6000);
    return () => clearInterval(id);
  }, [images]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const r = await fetch(`${apiBase}/pictures/upload`, { method: "POST", body: form });
    if (!r.ok) { alert(`Upload failed (HTTP ${r.status})`); return; }
    const json = await r.json(); 
    setImages(prev => [...prev, json.name]); 
    setFile(null);
    setPreview(null);
  };

  const ShowUploader = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">＋ Add Picture</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload an image</DialogTitle>
        </DialogHeader>
        <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} />
        {preview && <img src={preview} alt="Preview" className="mt-4 w-full max-w-xs rounded-md" />}
        <DialogFooter>
          <Button onClick={handleUpload} disabled={!file}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {loading ? (
        <p className="text-sm text-gray-500">Loading pictures…</p>
      ) : images.length ? (
        <img
          src={`${apiBase}/media/${images[index]}`}
          alt={`Slide ${index + 1}`}
          className="w-full max-w-xl rounded-md object-cover"
        />
      ) : (
        <p className="text-sm text-gray-500">No pictures yet.</p>
      )}

      {type === "caretaker" && <ShowUploader />}
    </div>
  );
}
