// Consider moving this out of `editor` since it works with data loading?

import type { EditorSchema } from './types'

export type DataComponentSchemaEntry = {
  id: string
  value_schema: EditorSchema
}

let entriesPromise: Promise<readonly DataComponentSchemaEntry[]> | null = null
let byIdPromise: Promise<Map<string, DataComponentSchemaEntry>> | null = null

const loadRawSchemas = () =>
  import('../../data/editor-schema/data_component_schema.json').then(
    ({ default: schema }) => schema as DataComponentSchemaEntry[],
  )

export function loadDataComponentSchemas() {
  if (!entriesPromise) {
    entriesPromise = loadRawSchemas()
  }

  return entriesPromise
}

const loadSchemasById = () => {
  if (!byIdPromise) {
    byIdPromise = loadDataComponentSchemas().then((entries) => {
      const map = new Map<string, DataComponentSchemaEntry>()

      for (const entry of entries) {
        map.set(entry.id, entry)
      }

      return map
    })
  }

  return byIdPromise
}

export async function getDataComponentSchemaById(componentId: string) {
  return (await loadSchemasById()).get(componentId) ?? null
}

