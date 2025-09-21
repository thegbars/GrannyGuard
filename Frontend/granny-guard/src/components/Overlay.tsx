type Overlay = {
    x: number  // 0–200 coordinate
    y: number  // 0–250 coordinate
    src: string // URL or import of the marker image
    size?: number // width/height in px (defaults to 25)
    key?: string | number // unique key if needed
}

type MapProps = {
    overlays: Overlay[]
    width?: number  // map display width in px (defaults to 300)
    height?: number // map display height in px (defaults to 375)
}
