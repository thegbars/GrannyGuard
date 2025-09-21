import React from "react";

type Overlay = {
  x: number; 
  y: number; 
  src: string;
  size?: number;
  key?: string | number;
};

type WorldBounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

type MapProps = {
  overlays: Overlay[];
  width?: number;   
  height?: number;  
  className?: string;
  worldBounds?: WorldBounds; 
};

const Map: React.FC<MapProps> = ({
  overlays,
  width = 300,
  height = 375,
  className = "",
  worldBounds = { xMin: 0, xMax: 200, yMin: 0, yMax: 250 }, 
}) => {
  const worldW = worldBounds.xMax - worldBounds.xMin;
  const worldH = worldBounds.yMax - worldBounds.yMin;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <img
        src="/Map.png"
        className="absolute top-0 left-0 w-full h-full object-cover"
        alt=""
      />

      {overlays.map((ovl, idx) => {
        const size = ovl.size ?? 25;
        const half = size / 2;

        const pxX = ((ovl.x - worldBounds.xMin) / worldW) * width;
        const pxY = ((ovl.y - worldBounds.yMin) / worldH) * height;

        const left = pxX - half;
        const top  = height - pxY - half;

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