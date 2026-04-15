import type {EditorBaseProps, EditorResult} from "../../types.ts";
import {ItemSelectorEditor} from "../ItemSelectorEditor";
import {useEffect, useState} from "react";
import type {ItemStackEditorResult} from "./types.ts";
import NumberEditor from "../NumberEditor.tsx";

import './ItemStackEditor.css'

export default function ItemStackEditor({context, callback}: EditorBaseProps<Record<string, unknown>, ItemStackEditorResult>) {
  const [itemResult, setItemResult] = useState<EditorResult<unknown> | null>(null)
  const [amountResult, setAmountResult] = useState<EditorResult<unknown> | null>(null)

  const doCallback = (
    item: EditorResult<unknown> | null = itemResult,
    amount: EditorResult<unknown> | null = amountResult
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
        components: []
      }
    })
  }

  useEffect(() => {
    doCallback()
  }, [itemResult, amountResult])

  return (
    <div className={'itemStackEditor'}>
      <div className={'firstRow'}>
        <span>Amount: </span>
        <NumberEditor className={'amountEditor'} context={{}} defaultValue={1} type={'int'} min={1} callback={result => {
          setAmountResult(result)
        }} />
        <ItemSelectorEditor context={context} callback={result => {
          setItemResult(result)
        }}/>
      </div>
    </div>
  )
}