import React from 'react';
import ReactDOM from 'react-dom/client';

import GraphEditor from '@comfy-creator/graph-editor';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GraphEditor />
  </React.StrictMode>
);
