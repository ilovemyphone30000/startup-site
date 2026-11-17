import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/courier-prime/400.css'
import '@fontsource/courier-prime/700.css'
import '@fontsource/anton/400.css'
import './index.css'
import App from './App'
import { NAME } from './config'

document.title = `${NAME} | class project prototype`

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
