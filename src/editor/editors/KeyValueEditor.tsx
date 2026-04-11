import * as React from "react"
import './KeyValueEditor.css'

/**
 * A conventional key-value paired editor, with labels on the left column and inputs on the right.
 *
 */
export default function KeyValueEditor({ children }: {
  children: React.ReactNode
}) {
  return (
    <div className='editor keyValueEditor'>
      {children}
    </div>
  )
}
