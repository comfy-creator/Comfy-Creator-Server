import {createContext, useContext, useEffect, useState} from "react";
import {ComfyApp} from "../scripts/app.ts";

export interface ComfyAppContextType {
    app: ComfyApp | null;
}

const ComfyAppContext = createContext<ComfyAppContextType>(null);

export function useComfyApp() {
    const context = useContext(ComfyAppContext);
    if (!context) {
        throw new Error('useComfyApp must be used within a ComfyAppContextProvider');
    }

    return context;
}


export function ComfyAppProvider({children}: { children: React.ReactNode }) {
    const [app, setApp] = useState<ComfyApp | null>(null);

    useEffect(() => {
        const app = ComfyApp.getInstance();
        setApp(app);

        window.app = app;
        window.graph = app.graph;
    }, []);

    return (
        <ComfyAppContext.Provider value={{app}}>
            {children}
        </ComfyAppContext.Provider>
    )
}
