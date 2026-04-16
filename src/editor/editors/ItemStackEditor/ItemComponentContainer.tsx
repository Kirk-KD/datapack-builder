import './ItemComponentContainer.css'
import * as React from "react";

type ItemComponentContainerProp = {
  name: string
  editor: React.ReactElement
}

export default function ItemComponentContainer({ name, editor }: ItemComponentContainerProp) {
  return (
    <div className={'itemComponentContainer'}>
      <div className={'itemComponentHeader'}>
        <span className={'itemComponentName'}>{name}</span>
        <button>-</button>
      </div>
      {editor}
    </div>
  )
}