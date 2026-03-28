import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: #0a0e1a; -webkit-font-smoothing: antialiased; }
  button { font-family: inherit; }
  input, textarea { font-family: inherit; }
  a { color: inherit; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0e1a; }
  ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 2px; }

  /* Animations */
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes waveBar {
    from { height: 4px; }
    to   { height: 20px; }
  }
  @keyframes dotPulse {
    from { opacity: 0.3; transform: scale(0.8); }
    to   { opacity: 1;   transform: scale(1.1); }
  }

  /* Safe area for iPhone notch/home bar */
  body { padding-bottom: env(safe-area-inset-bottom); }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
