import './ItemComponentContainer.css'
import * as React from "react";

type ItemComponentContainerProp = {
  name: string
  editor: React.ReactElement | null
  removeComponent: (key: string) => void
}

export default function ItemComponentContainer({ name, editor, removeComponent }: ItemComponentContainerProp) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '0.5rem'
    }}>
      <div className={'itemComponentContainer'}>
        <div className={'itemComponentHeader'}>
          <span className={'itemComponentName'}>{editor === null ? <b>!</b> : ''} {name}</span>
        </div>
        <div>
          <div style={{
            padding: 'var(--padding-small)'
          }}>{editor}</div>
        </div>
      </div>
      <div><button onClick={() => removeComponent(name)}>-</button></div>
    </div>
  )
}