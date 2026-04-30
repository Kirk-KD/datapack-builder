export type RegistryEventType = 'add' | 'remove' | 'update' | 'replace' | 'clear'

export interface RegistryEvent<TEntry> {
  type: RegistryEventType
  currentEntries: TEntry[]
  changedEntries: TEntry[]
}

export type RegistryListener<TEntry> = (event: RegistryEvent<TEntry>) => void

export interface RegistryOptions<TEntry> {
  getEntryId: (entry: TEntry) => string
}

export class Registry<TEntry> {
  private entries: TEntry[] = []
  private readonly listeners = new Set<RegistryListener<TEntry>>()
  private readonly getEntryId: (entry: TEntry) => string

  constructor(options: RegistryOptions<TEntry>) {
    this.getEntryId = options.getEntryId
  }

  subscribe(listener: RegistryListener<TEntry>): () => void {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  add(entry: TEntry): TEntry {
    this.entries = [...this.entries, entry]
    this.emit('add', [entry])
    return entry
  }

  update(entry: TEntry): TEntry {
    const entryId = this.getEntryId(entry)
    const entryIndex = this.entries.findIndex((currentEntry) => this.getEntryId(currentEntry) === entryId)

    if (entryIndex === -1) {
      throw new Error(`Cannot update registry entry "${entryId}" because it does not exist`)
    }

    this.entries = this.entries.map((currentEntry, index) => index === entryIndex ? entry : currentEntry)
    this.emit('update', [entry])
    return entry
  }

  replace(entries: TEntry[]): TEntry[] {
    this.entries = [...entries]
    this.emit('replace', this.entries)
    return this.list()
  }

  remove(entryId: string): TEntry | null {
    const entry = this.findById(entryId)
    if (!entry) return null

    this.entries = this.entries.filter((currentEntry) => this.getEntryId(currentEntry) !== entryId)
    this.emit('remove', [entry])
    return entry
  }

  clear(): void {
    if (this.entries.length === 0) return

    const removedEntries = this.entries
    this.entries = []
    this.emit('clear', removedEntries)
  }

  list(): TEntry[] {
    return [...this.entries]
  }

  filter(predicate: (entry: TEntry) => boolean): TEntry[] {
    return this.entries.filter(predicate)
  }

  find(predicate: (entry: TEntry) => boolean): TEntry | undefined {
    return this.entries.find(predicate)
  }

  findById(entryId: string): TEntry | undefined {
    return this.entries.find((entry) => this.getEntryId(entry) === entryId)
  }

  protected emit(type: RegistryEventType, changedEntries: TEntry[]): void {
    const event: RegistryEvent<TEntry> = {
      type,
      currentEntries: this.list(),
      changedEntries: [...changedEntries],
    }

    for (const listener of this.listeners) {
      listener(event)
    }
  }
}
