import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {bootstrapBlockly} from './core/blockly'
import {bootstrapCompiler} from './core/compiler'

bootstrapBlockly()
bootstrapCompiler()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
