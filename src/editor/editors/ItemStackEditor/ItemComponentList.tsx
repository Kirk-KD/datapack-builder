import './ItemComponentList.css'
import DropdownInput from "../../components/DropdownInput.tsx";
import ItemComponentContainer from "./ItemComponentContainer.tsx";
import type {ItemComponent} from "./types.ts";
import type {EditorResult, EditorResultCallback, EditorSchema} from "../../types.ts";
import {useEffect, useMemo, useState} from "react";
import {loadDataComponentSchemas} from "../../../catalog/dataComponentSchemaCatalog.ts";
import loadFromSchema from "../../loader/loadFromSchema.tsx";

type ItemComponentListProps = {
  callback: (components: ItemComponent[]) => void
}

type ItemComponentEntry = {
  result: EditorResult<unknown> | null
  negate: boolean
  callback: EditorResultCallback<unknown>
}

export default function ItemComponentList({ callback }: ItemComponentListProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string>()
  const [componentLookup, setComponentLookup] = useState<Record<string, EditorSchema> | null>(null)
  const [components, setComponents] = useState<Record<string, ItemComponentEntry>>({})

  const addComponent = ({key, negate}: {key: string, negate?: boolean}) => {
    setComponents(prev => ({
      ...prev,
      [key]: {
        result: null,
        negate: negate || false,
        callback: result => {
          setComponents(prev2 => ({
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
    })
  }, [])

  useEffect(() => {
    callback(Object.entries(components).map(([key, {result, negate}]) => ({
      key,
      result,
      negate
    })))
  }, [components])

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
        Object.entries(components).map(([key, { negate, callback}]) => (
          <ItemComponentContainer key={key} name={key} editor={negate ? null : loadFromSchema(componentLookup[key], { context: {}, callback })} removeComponent={removeComponent}/>
        ))
      }</div>
    </div>
  )
}