import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'

try {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.style.colorScheme = 'dark'
  localStorage.setItem('theme', 'dark')
} catch {
  // Ignore storage failures and keep the app in dark mode visually.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
