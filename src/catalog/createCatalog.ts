export type CatalogDefinition<TRaw, TEntry, TKey extends string> = {
  loadRaw: () => Promise<TRaw>
  toEntries: (raw: TRaw) => readonly TEntry[]
  getKey: (entry: TEntry) => TKey
}

export type Catalog<TEntry, TKey extends string> = {
  loadEntries: () => Promise<readonly TEntry[]>
  getByKey: (key: TKey) => Promise<TEntry | null>
}

export function createCatalog<TRaw, TEntry, TKey extends string>(
  definition: CatalogDefinition<TRaw, TEntry, TKey>,
): Catalog<TEntry, TKey> {
  let entriesPromise: Promise<readonly TEntry[]> | null = null
  let byKeyPromise: Promise<Map<TKey, TEntry>> | null = null

  function loadEntries() {
    if (!entriesPromise) {
      entriesPromise = definition.loadRaw().then((raw) => definition.toEntries(raw))
    }

    return entriesPromise
  }

  function loadByKey() {
    if (!byKeyPromise) {
      byKeyPromise = loadEntries().then((entries) => {
        const map = new Map<TKey, TEntry>()

        for (const entry of entries) {
          map.set(definition.getKey(entry), entry)
        }

        return map
      })
    }

    return byKeyPromise
  }

  return {
    loadEntries,
    async getByKey(key: TKey) {
      return (await loadByKey()).get(key) ?? null
    },
  }
}
