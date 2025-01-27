import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import AppUmd from './App.umd.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppUmd />
  </StrictMode>,
)
