import DropdownInput from "../../components/DropdownInput.tsx";
import ItemComponentContainer from "./ItemComponentContainer.tsx";
import type {AnyEditorState, AnyEditorStateCallback, EditorSchema} from "../../types.ts";
import {type SetStateAction, useEffect, useState} from "react";
import {loadDataComponentSchemas} from "../../../catalog/dataComponentSchemaCatalog.ts";
import loadFromSchema from "../../loadFromSchema.tsx";
import type {ItemComponent} from "./ItemStackEditor.tsx";
import {inferCompilerType} from "../../../compiler/compileEditorState.ts";
import {Stack, Typography} from "@mui/material";
import EditorButton from "../../components/EditorButton.tsx";

type ItemComponentListProps = {
  itemComponents: ItemComponent[]
  setItemComponents: (components: ItemComponent[]) => void
}

type ItemComponentEntry = {
  state: AnyEditorState
  setState: AnyEditorStateCallback
  negate: boolean
}

const applyStateAction = (prevState: AnyEditorState, nextState: SetStateAction<AnyEditorState>): AnyEditorState =>
  typeof nextState === 'function' ? nextState(prevState) : nextState

export default function ItemComponentList({ itemComponents, setItemComponents }: ItemComponentListProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>(undefined)
  const [componentLookup, setComponentLookup] = useState<Record<string, EditorSchema> | null>(null)
  const [components, setComponents] = useState<Record<string, ItemComponentEntry>>({})

  const addComponent = ({key, state, negate}: {key: string, state: AnyEditorState, negate?: boolean}) => {
    setComponents(prev => ({
      ...prev,
      [key]: {
        state,
        negate: negate || false,
        setState: result => {
          setComponents(prev2 => ({
            ...prev2,
            [key]: {
              ...prev2[key],
              state: applyStateAction(prev2[key].state, result)
            } as ItemComponentEntry
          }))
        }
      }
    }))
    setSelectedComponentId(availableComponents.find(id => id !== key))
  }

  const removeComponent = (key: string) => {
    setComponents(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const availableComponents = Object.keys(componentLookup ?? {}).filter(id => !Object.keys(components).includes(id))

  useEffect(() => {
    loadDataComponentSchemas().then(schemas => {
      const lookup = Object.fromEntries(schemas.map(schema => [schema.id, schema.value_schema]))
      setComponentLookup(lookup)

      const initialComponents: Record<string, ItemComponentEntry> = {}
      itemComponents.forEach(({ key, state, negate }) => {
        initialComponents[key] = {
          state,
          negate,
          setState: result => {
            setComponents(prev => ({
              ...prev,
              [key]: {
                ...prev[key],
                state: applyStateAction(prev[key].state, result)
              } as ItemComponentEntry
            }))
          }
        }
      })
      setComponents(initialComponents)

      const existingKeys = itemComponents.map(c => c.key)
      const firstAvailable = Object.keys(lookup).find(id => !existingKeys.includes(id))
      setSelectedComponentId(firstAvailable)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setItemComponents(Object.entries(components).map(([key, {state, negate}]) => ({
      key,
      state,
      negate
    })))
  }, [components]) // eslint-disable-line react-hooks/exhaustive-deps

  if (componentLookup === null) return (
    <div>Loading...</div>
  )

  return (
    <Stack spacing={1}>
      <Stack direction={'row'} spacing={0.5} sx={{
        alignItems: 'center'
      }}>
        <Typography>Add component:</Typography>
        <DropdownInput
          options={availableComponents}
          value={selectedComponentId}
          setValue={setSelectedComponentId}
          sx={{
            flex: 1
          }}
        />
        <EditorButton onClick={() => selectedComponentId && addComponent({
          key: selectedComponentId,
          state: {error: false, compiler: inferCompilerType(componentLookup[selectedComponentId])}
        })}>+</EditorButton>
        <EditorButton onClick={() => selectedComponentId && addComponent({
          key: selectedComponentId,
          negate: true,
          state: {error: false, compiler: inferCompilerType(componentLookup[selectedComponentId])}
        })}>+ !</EditorButton>
      </Stack>

      <Stack spacing={1}>{
        Object.entries(components).map(([key, { negate, state, setState}]) => (
          <ItemComponentContainer
            key={key}
            name={key}
            editor={negate ? null : loadFromSchema(componentLookup[key], { context: {}, state, setState })}
            removeComponent={removeComponent}
          />
        ))
      }</Stack>
    </Stack>
  )
}