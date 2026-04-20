import './ItemComponentList.css'
import DropdownInput from "../../components/DropdownInput.tsx";
import ItemComponentContainer from "./ItemComponentContainer.tsx";
import type {AnyEditorState, AnyEditorStateCallback, EditorSchema} from "../../types.ts";
import {type SetStateAction, useEffect, useMemo, useState} from "react";
import {loadDataComponentSchemas} from "../../../catalog/dataComponentSchemaCatalog.ts";
import loadFromSchema from "../../loadFromSchema.tsx";
import type {ItemComponent} from "./ItemStackEditor.tsx";

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
  const [selectedComponentId, setSelectedComponentId] = useState<string>()
  const [componentLookup, setComponentLookup] = useState<Record<string, EditorSchema> | null>(null)
  const [components, setComponents] = useState<Record<string, ItemComponentEntry>>({})

  const addComponent = ({key, state, negate}: {key: string, state?: AnyEditorState, negate?: boolean}) => {
    setComponents(prev => ({
      ...prev,
      [key]: {
        state: state ?? { error: false },
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
  }

  const removeComponent = (key: string) => {
    setComponents(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const availableComponents = useMemo(
    () => Object.keys(componentLookup ?? {}).filter(id => !Object.keys(components).includes(id)),
    [componentLookup, components]
  )

  useEffect(() => {
    loadDataComponentSchemas().then(schemas => {
      setComponentLookup(Object.fromEntries(schemas.map(schema => [schema.id, schema.value_schema])))
      itemComponents.forEach(addComponent)
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
    <div className={'itemComponentList'}>
      <div className={'top'}>
        <span>Add component:</span>
        <DropdownInput
          className={'itemComponentDropdown'}
          options={availableComponents}
          value={selectedComponentId}
          setValue={setSelectedComponentId}
        />
        <button onClick={() => selectedComponentId && addComponent({key: selectedComponentId})}>+</button>
        <button onClick={() => selectedComponentId && addComponent({key: selectedComponentId, negate: true})}>+ !</button>
      </div>

      <div className={'componentEditorsContainer'}>{
        Object.entries(components).map(([key, { negate, state, setState}]) => (
          <ItemComponentContainer key={key} name={key} editor={negate ? null : loadFromSchema(componentLookup[key], { context: {}, state, setState })} removeComponent={removeComponent}/>
        ))
      }</div>
    </div>
  )
}