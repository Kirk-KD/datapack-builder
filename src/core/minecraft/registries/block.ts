import {MinecraftRegistry} from '../registry'
import type {BlockEntry} from '../types.ts'
import {fetchRegistry} from '../loader'

let cache: MinecraftRegistry<BlockEntry> | null = null

export async function getBlockRegistry(): Promise<MinecraftRegistry<BlockEntry>> {
  if (cache) return cache

  const raw = await fetchRegistry<string[]>('/src/data/minecraft/block.json')
  cache = new MinecraftRegistry(new Map(raw.map(id => [id, id])))
  return cache
}
