import { useEffect } from 'react'

function RibbonsBackground() {
    useEffect(() => {
        import('../utils/ribbons.js').then((module) => {
            if (window.Ribbons) {
                const ribbons = new window.Ribbons({
                    colorSaturation: "50%",
                    colorBrightness: "60%",
                    colorAlpha: 0.2,
                    colorCycleSpeed: 3,
                    verticalPosition: "center",
                    horizontalSpeed: 90,
                    ribbonCount: 0,          // No auto
                    strokeSize: 0,
                    parallaxAmount: -0.1,
                    animateSections: true,
                })
                ribbons.startManualRibbons(10000)
            }
        })
    }, [])

    return null
}

export default RibbonsBackground
