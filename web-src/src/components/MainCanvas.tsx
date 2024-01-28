import {useEffect, useRef} from "react";
import {useComfyApp} from "../providers/ComfyApp";

export function MainCanvas() {
    const {app} = useComfyApp();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (canvasRef.current && app) {
            canvasRef.current = app.canvasEl;
        }
    }, []);

    return (
        <canvas ref={canvasRef} style={{width: "100%", height: "100%"}}/>
    )
}
