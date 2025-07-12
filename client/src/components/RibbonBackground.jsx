import { useEffect } from "react"

function RibbonsBackground() {
    useEffect(() => {
        import("../utils/ribbons.js").then(() => {
            if (window.Ribbons) {
                new window.Ribbons({
                    colorSaturation: "70%",
                    colorBrightness: "55%",
                    colorAlpha: 0.2,
                    colorCycleSpeed: 3,
                    verticalPosition: "random",
                    horizontalSpeed: 100,
                    ribbonCount: 2,
                    strokeSize: 0,
                    parallaxAmount: 0,
                    animateSections: true,
                })
            }
        })
    }, [])

    return null
}

export default RibbonsBackground
