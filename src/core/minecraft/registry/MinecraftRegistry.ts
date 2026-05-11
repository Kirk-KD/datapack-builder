export class MinecraftRegistry<T> {
  private entries: Map<string, T>

  constructor(entries: Map<string, T>) {
    this.entries = entries
  }

  get(id: string): T | undefined {
    return this.entries.get(id)
  }

  getAll(): T[] {
    return Array.from(this.entries.values())
  }

  filter(predicate: (entry: T) => boolean): T[] {
    return Array.from(this.entries.values()).filter(predicate)
  }

  // TODO better search
  search(query: string): T[] {
    if (query.length === 0) return this.getAll()

    return Array.from(this.entries.keys())
      .filter(key => key.toLowerCase().startsWith(query.toLowerCase()))
      .map(key => this.entries.get(key)!)
  }
}
