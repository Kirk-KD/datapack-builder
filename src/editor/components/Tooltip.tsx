import * as React from "react"
import './Tooltip.css'

// TODO fix clipping?
export default function Tooltip({ text, children }: { text?: string, children: React.ReactElement}) {
  if (!text) return children
  return (
    <span className={'tooltipWrapper'}>
      {children}
      <span className={'tooltip'}>{text}</span>
    </span>
  )
}