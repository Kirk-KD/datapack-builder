import type {EditorBaseProps, EditorResult, EditorResultCallback} from "../../types.ts";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import './ListEditor.css'
import ResetButton from "../../components/ResetButton.tsx";

type ListEditorProps = EditorBaseProps<Record<string, unknown>, unknown[]> & {
  itemEditor: (cb: EditorResultCallback<unknown>) => React.ReactElement
}

type ListItemEntry = {
  result: EditorResult<unknown> | null
  callback: EditorResultCallback<unknown>
}

export default function ListEditor({ callback, itemEditor }: ListEditorProps) {
  const [items, setItems] = useState<Record<string, ListItemEntry>>({})

  const nextKey = useRef(0)

  const addItem = () => {
    const key = (nextKey.current++).toString()
    setItems(prev => ({
      ...prev,
      [key]: {
        result: null,
        callback: result => {
          setItems(prev2 => ({
            ...prev2,
            [key]: {
              ...prev2[key],
              result
            }
          }))
        }
      }
    }))
  }

  const removeItem = (key: string) => {
    setItems(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  useEffect(() => {
    if (Object.values(items).some(({ result }) => result?.error)) callback({ error: true })
    else callback({
      error: false,
      data: Object.values(items).map(({ result }) => result?.data)
    })
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={'editor listEditor'}>
      <div className={'listEditorHeader'}>
        <span style={{
          color: 'var(--colour-text-muted)',
          flexGrow: 1
        }}>{Object.keys(items).length ? `List [${Object.keys(items).length}]` : '[Empty]'}</span>
        <ResetButton handleReset={() => setItems({})}/>
        <button onClick={addItem}>+</button>
      </div>
      {Object.keys(items).length ? <div className={'listEditorList'}>{
        Object.entries(items)
          .map(([key, {callback: cb}]) => (
            <ListItem editor={itemEditor(cb)} key={key} addItem={addItem} removeItem={() => removeItem(key)}/>
          ))
      }</div> : null}
    </div>
  )
}

type ListItemProps = {
  editor: React.ReactElement
  addItem: () => void
  removeItem: () => void
}

function ListItem({ editor, addItem, removeItem }: ListItemProps) {
  return (
    <div className={'listItem'}>
      <div style={{
        borderRadius: 'var(--border-radius-small)',
        border: '1px solid var(--colour-border-muted)'
      }}>{editor}</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button onClick={removeItem}>-</button>
        <button onClick={addItem} className={'addItemButton'}>+</button>
      </div>
    </div>
  )
}