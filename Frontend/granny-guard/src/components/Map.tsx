type OverlayProps = {
    x: number; // 0–200
    y: number; // 0–250
};

const Map = ({ x, y }: OverlayProps) => {
    const scaledX = (x / 200) * 300;
    const scaledY = (y / 250) * 375;
    const cssX = scaledX - 12.5;
    const cssY = 375 - scaledY - 12.5;




    return (
        <div className="relative w-[300px] h-[375px]">
            <img
                src="/Map.png"
                className="absolute top-0 left-0 w-full h-full object-cover"
            />
            <img
                src="/old-woman.png"
                className="absolute w-[25px] h-[25px]"
                style={{
                    left: `${cssX}px`,
                    top: `${cssY}px`,
                }}
            />
        </div>
    );
};

export default Map;
