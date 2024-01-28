import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {ComfyAppProvider} from "./providers/ComfyApp.tsx";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ComfyAppProvider>
          <App/>
      </ComfyAppProvider>
  </React.StrictMode>,
)
