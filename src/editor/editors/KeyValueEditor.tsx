import * as React from "react"
import './KeyValueEditor.css'

type EditorProps = {
  children: React.ReactNode
  darkBackground?: boolean
}

/**
 * A conventional key-value paired editor, with labels on the left column and inputs on the right.
 *
 */
export default function KeyValueEditor({ children, darkBackground }: EditorProps) {
  return (
    <div
      className='editor'
      style={darkBackground ? {
        backgroundColor: `rgba(0 0 0 10%)`
      } : {}}
    >
      {children}
    </div>
  )
}
