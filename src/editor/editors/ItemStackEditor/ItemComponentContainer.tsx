import './ItemComponentContainer.css'
import * as React from "react";

type ItemComponentContainerProp = {
  name: string
  editor: React.ReactElement | null
  removeComponent: (key: string) => void
}

export default function ItemComponentContainer({ name, editor, removeComponent }: ItemComponentContainerProp) {
  return (
    <div className={'itemComponentContainer'}>
      <div className={'itemComponentHeader'}>
        <span className={'itemComponentName'}>{editor === null ? <b>!</b> : ''} {name}</span>
        <button onClick={() => removeComponent(name)}>-</button>
      </div>
      {editor}
    </div>
  )
}