import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Global reset styles
const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d1117; }
  button { font-family: inherit; }
  input { font-family: inherit; }
  a { color: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0d1117; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
`
document.head.appendChild(style)

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
