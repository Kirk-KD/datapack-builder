import type {EditorBaseProps, EditorState, EditorStateCallback} from "../../types.ts";
import * as React from "react";
import {type SetStateAction, useEffect, useRef, useState} from "react";
import './ListEditor.css'
import ResetButton from "../../components/ResetButton.tsx";

type ListEditorProps = EditorBaseProps<Record<string, unknown>, unknown[]> & {
  itemEditor: (itemState: EditorState<unknown>, setItemState: EditorStateCallback<unknown>) => React.ReactElement
}

type ListItemEntry = {
  state: EditorState<unknown>
  setState: EditorStateCallback<unknown>
}

export default function ListEditor({ state, setState, itemEditor }: ListEditorProps) {
  const nextKey = useRef(0)

  const [items, setItems] = useState<Record<string, ListItemEntry>>(() => {
    if (state.data === undefined) return {}

    const initial: Record<string, ListItemEntry> = {}
    state.data.forEach((value, index) => {
      const key = index.toString()
      nextKey.current = index + 1
      initial[key] = {
        state: value as EditorState<unknown>,
        setState: itemState => {
          // eslint-disable-next-line react-hooks/immutability
          setItems((prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              state: itemState
            }
          })) as SetStateAction<Record<string, ListItemEntry>>)
        }
      }
    })
    return initial
  })

  const addItem = () => {
    const key = (nextKey.current++).toString()
    setItems(prev => ({
      ...prev,
      [key]: {
        state: { error: false },
        setState: state => {
          setItems((prev2 => ({
            ...prev2,
            [key]: {
              ...prev2[key],
              state
            }
          })) as SetStateAction<Record<string, ListItemEntry>>)
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
    if (Object.values(items).some(({ state }) => state.error)) setState({ ...state, error: true })
    else setState({
      error: false,
      data: Object.values(items).map(({ state }) => state)
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
          .map(([key, {state: itemState, setState: setItemState}]) => (
            <ListItem editor={itemEditor(itemState, setItemState)} key={key} addItem={addItem} removeItem={() => removeItem(key)}/>
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