import {MinecraftRegistry} from '../registry'
import type {ItemEntry} from '../types.ts'
import {fetchRegistry} from '../loader'

let cache: MinecraftRegistry<ItemEntry> | null = null

export async function getItemRegistry(): Promise<MinecraftRegistry<ItemEntry>> {
  if (cache) return cache

  const raw = await fetchRegistry<string[]>('/src/data/minecraft/item.json')
  cache = new MinecraftRegistry(new Map(raw.map(id => [id, id])))
  return cache
}

export function getItemSpritePath(id: ItemEntry): string {
  return `/src/data/minecraft/item_sprites/${id}.png`
}
