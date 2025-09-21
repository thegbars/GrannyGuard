import { useEffect, useState } from "react";
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

type PicturesProps = {
    type: "granny" | "caretaker";
};

const Pictures = ({ type }: PicturesProps) => {
    const [images, setImages] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    useEffect(() => {
        fetch("/pictureList.json")
            .then((res) => res.json())
            .then((data: string[]) => setImages(data));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((i) => (images.length ? (i + 1) % images.length : 0));
        }, 6000);
        return () => clearInterval(timer);
    }, [images]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "image/png") {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = () => {
        if (filePreview) {
            setImages((prev) => [...prev, filePreview]);
            setFilePreview(null);
        }
    };

    if (!images.length) return null;

    return (
        <div className="flex flex-col items-center gap-4">
            <img
                src={images[index]}
                alt={`Slide ${index + 1}`}
                className="w-full max-w-xl rounded-md object-cover"
            />

            {type === "caretaker" && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">＋ Add Picture</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload a PNG</DialogTitle>
                        </DialogHeader>
                        <Input type="file" accept="image/png" onChange={handleFileChange} />
                        {filePreview && (
                            <img
                                src={filePreview}
                                alt="Preview"
                                className="mt-4 w-full max-w-xs rounded-md"
                            />
                        )}
                        <DialogFooter>
                            <Button onClick={handleAdd} disabled={!filePreview}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default Pictures;
