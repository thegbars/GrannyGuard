// Map.tsx
import React from "react";

type Overlay = {
    x: number;
    y: number;
    src: string;
    size?: number;
    key?: string | number;
};

type MapProps = {
    overlays: Overlay[];
    width?: number;   // used for math
    height?: number;  // used for math
    className?: string; // new: for tailwind sizing
};

const Map: React.FC<MapProps> = ({
                                     overlays,
                                     width = 300,
                                     height = 375,
                                     className = "",
                                 }) => {
    const scaleX = width / 200;
    const scaleY = height / 250;

    return (
        <div
            className={`relative ${className}`}
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            <img
                src="/Map.png"
                className="absolute top-0 left-0 w-full h-full object-cover"
            />

            {overlays.map((ovl, idx) => {
                const size = ovl.size ?? 25;
                const half = size / 2;
                const left = ovl.x * scaleX - half;
                const top = height - ovl.y * scaleY - half;

                return (
                    <img
                        key={ovl.key ?? idx}
                        src={ovl.src}
                        width={size}
                        height={size}
                        className="absolute"
                        style={{ left: `${left}px`, top: `${top}px` }}
                        alt=""
                    />
                );
            })}
        </div>
    );
};

export default Map;
