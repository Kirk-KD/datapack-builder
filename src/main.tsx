import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Blockly from 'blockly'
import App from './App.tsx'
import './index.css'

Blockly.Msg['PROCEDURES_DEFNORETURN_TITLE'] = 'define'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
