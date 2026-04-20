import type {EditorBaseProps, EditorState} from "../../types.ts";
import {ItemSelectorEditor} from "../ItemSelectorEditor";
import {useEffect, useState} from "react";
import NumberEditor from "../NumberEditor.tsx";

import './ItemStackEditor.css'
import ItemComponentList from "./ItemComponentList.tsx";

export type ItemComponent = {
  key: string
  state: EditorState<unknown>
  negate: boolean
}

export type ItemStackEditorResult = {
  item: EditorState<string>
  amount: EditorState<number>
  components: ItemComponent[]
}

export default function ItemStackEditor({context, state, setState}: EditorBaseProps<Record<string, unknown>, ItemStackEditorResult>) {
  const [itemState, setItemState] = useState<EditorState<string>>(state.data?.item ?? { error: false })
  const [amountState, setAmountState] = useState<EditorState<number>>(state.data?.amount ?? { error: false })
  const [itemComponents, setItemComponents] = useState<ItemComponent[]>(state.data?.components ?? [])

  const doCallback = (
    item: EditorState<string> = itemState,
    amount: EditorState<number> = amountState,
    components: ItemComponent[] = itemComponents
  ) => {
    if (item?.error || amount?.error || !item || !amount || components.some(({state}) => state?.error)) {
      setState({ ...state, error: true })
      return
    }

    setState({
      error: false,
      data: {
        item: item,
        amount: amount,
        components: components
      }
    })
  }

  useEffect(() => {
    doCallback()
  }, [itemState, amountState, itemComponents]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={'editor itemStackEditor'}>
      <div className={'firstRow'}>
        <ItemSelectorEditor context={context} state={itemState} setState={setItemState}/>
        <span>count:</span>
        <NumberEditor className={'amountEditor'} defaultValue={1} type={'int'} min={1} state={amountState} setState={setAmountState} />
      </div>
      <ItemComponentList itemComponents={itemComponents} setItemComponents={result => {
        setItemComponents(result)
      }}/>
    </div>
  )
}