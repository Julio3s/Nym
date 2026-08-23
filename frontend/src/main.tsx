import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'

// Applique le thème persisté AVANT le premier rendu pour éviter un "flash".
const storedTheme = localStorage.getItem('theme')
const theme = storedTheme === 'light' ? 'light' : 'dark'
document.documentElement.setAttribute('data-theme', theme)
document.documentElement.style.colorScheme = theme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
