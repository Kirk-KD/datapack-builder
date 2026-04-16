import type {EditorBaseProps, EditorResult} from "../../types.ts";
import {ItemSelectorEditor} from "../ItemSelectorEditor";
import {useEffect, useState} from "react";
import type {ItemComponent, ItemStackEditorResult} from "./types.ts";
import NumberEditor from "../NumberEditor.tsx";

import './ItemStackEditor.css'
import ItemComponentList from "./ItemComponentList.tsx";

export default function ItemStackEditor({context, callback}: EditorBaseProps<Record<string, unknown>, ItemStackEditorResult>) {
  const [itemResult, setItemResult] = useState<EditorResult<unknown> | null>(null)
  const [amountResult, setAmountResult] = useState<EditorResult<unknown> | null>(null)
  const [itemComponents, setItemComponents] = useState<ItemComponent[]>([])

  const doCallback = (
    item: EditorResult<unknown> | null = itemResult,
    amount: EditorResult<unknown> | null = amountResult,
    components: ItemComponent[] = itemComponents
  ) => {
    if (item?.error || amount?.error || !item || !amount) {
      callback({ error: true })
      return
    }

    callback({
      error: false,
      data: {
        item: item.data as string,
        amount: amount.data as number,
        components: components
      }
    })
  }

  useEffect(() => {
    doCallback()
  }, [itemResult, amountResult, itemComponents]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={'editor itemStackEditor'}>
      <div className={'firstRow'}>
        <ItemSelectorEditor context={context} callback={result => {
          setItemResult(result)
        }}/>
        <span>count:</span>
        <NumberEditor className={'amountEditor'} context={{}} defaultValue={1} type={'int'} min={1} callback={result => {
          setAmountResult(result)
        }} />
      </div>
      <ItemComponentList callback={result => {
        setItemComponents(result)
      }}/>
    </div>
  )
}