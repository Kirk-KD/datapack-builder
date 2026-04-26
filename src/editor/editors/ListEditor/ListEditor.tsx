import type {AnyEditorState, AnyEditorStateCallback, EditorBaseProps, EditorStateList} from "../../types.ts";
import * as React from "react";
import {type SetStateAction, useEffect, useRef, useState} from "react";
import ResetButton from "../../components/ResetButton.tsx";
import {Box, Stack, Typography} from "@mui/material";
import EditorButton from "../../components/EditorButton.tsx";
import InnerEditorContainer from "../../components/InnerEditorContainer.tsx";

type ListEditorProps = EditorBaseProps<Record<string, unknown>, EditorStateList> & {
  itemEditor: (itemState: AnyEditorState, setItemState: AnyEditorStateCallback) => React.ReactElement
}

type ListItemEntry = {
  state: AnyEditorState
  setState: AnyEditorStateCallback
}

const applyStateAction = (prevState: AnyEditorState, nextState: SetStateAction<AnyEditorState>): AnyEditorState =>
  typeof nextState === 'function' ? nextState(prevState) : nextState

export default function ListEditor({ state, setState, itemEditor }: ListEditorProps) {
  const nextKey = useRef(0)

  const [items, setItems] = useState<Record<string, ListItemEntry>>(() => {
    if (state.data === undefined) return {}

    const initial: Record<string, ListItemEntry> = {}
    state.data.forEach((value, index) => {
      const key = index.toString()
      nextKey.current = index + 1
      initial[key] = {
        state: value,
        setState: itemState => {
          // eslint-disable-next-line react-hooks/immutability
          setItems(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              state: applyStateAction(prev[key].state, itemState)
            }
          }))
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
        state: { compiler: 'list', error: false },
        setState: state => {
          setItems(prev2 => ({
            ...prev2,
            [key]: {
              ...prev2[key],
              state: applyStateAction(prev2[key].state, state)
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
    if (Object.values(items).some(({ state }) => state.error)) setState({ ...state, error: true })
    else setState({
      compiler: 'list',
      error: false,
      data: Object.values(items).map(({ state }) => state)
    })
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Stack direction={'row'} sx={{
        alignItems: 'center'
      }}>
        <Typography color={'textSecondary'}>{Object.keys(items).length ? `List [${Object.keys(items).length}]` : '[Empty]'}</Typography>
        <ResetButton handleReset={() => setItems({})}/>
        <EditorButton onClick={addItem}>+</EditorButton>
      </Stack>
      {Object.keys(items).length ? (
        <Stack spacing={1}>{
          Object.entries(items)
            .map(([key, {state: itemState, setState: setItemState}], index, arr) => (
              <ListItem
                editor={itemEditor(itemState, setItemState)}
                key={key} addItem={addItem}
                removeItem={() => removeItem(key)}
                isLast={index === arr.length - 1}
              />
            ))
        }</Stack>
      ) : null}
    </Box>
  )
}

type ListItemProps = {
  editor: React.ReactElement
  addItem: () => void
  removeItem: () => void
  isLast: boolean
}

function ListItem({ editor, addItem, removeItem, isLast }: ListItemProps) {
  return (
    <Stack direction={'row'} spacing={0.5}>
      <InnerEditorContainer>{editor}</InnerEditorContainer>
      <Stack>
        <EditorButton onClick={removeItem}>-</EditorButton>
        {isLast && <EditorButton onClick={addItem} sx={{ mt: 'auto' }}>+</EditorButton>}
      </Stack>
    </Stack>
  )
}