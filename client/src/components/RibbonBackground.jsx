import { useEffect } from "react"

function RibbonsBackground() {
    useEffect(() => {
        import("../utils/ribbons.js").then(() => {
            if (window.Ribbons) {
                new Ribbons({
                    colorSaturation: "60%",
                    colorBrightness: "50%",
                    colorAlpha: 0.2,
                    colorCycleSpeed: 2,
                    verticalPosition: "random",
                    horizontalSpeed: 20,
                    ribbonCount: 1,
                    strokeSize: 0,
                    parallaxAmount: -0.2,
                    animateSections: true,
                });

            }
        })
    }, [])

    return null
}

export default RibbonsBackground
