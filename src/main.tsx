import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        {/* La route /vota/:id è stata rimossa nella v2 — la gestione voti avviene direttamente in dashboard */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
