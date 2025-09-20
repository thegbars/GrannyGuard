import { useEffect, useState } from "react";

const Pictures = () => {
    const [images, setImages] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

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

    if (!images.length) return null;

    return (
        <div className="flex justify-center items-center">
            <img
                src={images[index]}
                alt={`Slide ${index + 1}`}
                className="w-full max-w-xl rounded-md object-cover"
            />
        </div>
    );
};

export default Pictures;
