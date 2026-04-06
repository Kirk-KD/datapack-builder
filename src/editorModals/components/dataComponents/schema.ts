import { useEffect, useState } from 'react'
import { loadDataComponentSchemas } from '../../../catalog/dataComponentSchemaCatalog'
import type { DataComponentSchemaEntry } from './types'

export function useDataComponentSchemas() {
  const [schemas, setSchemas] = useState<readonly DataComponentSchemaEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadDataComponentSchemas()
      .then((entries: readonly DataComponentSchemaEntry[]) => {
        if (cancelled) return
        setSchemas(entries)
        setError(null)
      })
      .catch((nextError: unknown) => {
        if (cancelled) return
        setError(nextError instanceof Error ? nextError.message : 'Failed to load component schema.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { schemas, error }
}
