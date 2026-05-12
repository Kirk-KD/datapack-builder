const cache = new Map<string, unknown>()

export async function fetchRegistry<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T

  const res = await fetch(path)
  const data = await res.json() as T

  cache.set(path, data)

  return data
}
