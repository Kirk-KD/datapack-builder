import { createAssetCatalog } from './createAssetCatalog'
import { createCatalog } from './createCatalog'

const spriteModuleLoaders = import.meta.glob('../data/minecraft/_item_sprites/*.png', {
  import: 'default',
}) as Record<string, () => Promise<string>>

export type MinecraftItemEntry = {
  name: string
  spriteFileName: string
}

const itemCatalog = createCatalog({
  loadRaw: () =>
    import('../../data/minecraft/_item_sprite_lookup.json').then(({ default: lookup }) => lookup),
  toEntries: (lookup) =>
    Object.entries(lookup).map(([name, spriteFileName]) => ({
      name,
      spriteFileName,
    })),
  getKey: (entry: MinecraftItemEntry) => entry.name,
})

const spriteCatalog = createAssetCatalog(spriteModuleLoaders)

/** @deprecated Use getItemRegistry from src/core/minecraft instead. */
export function loadMinecraftItemCatalog() {
  return itemCatalog.loadEntries()
}

/** @deprecated Use getItemRegistry/getItemSpritePath from src/core/minecraft instead. */
export async function getMinecraftItemByName(name: string) {
  return itemCatalog.getByKey(name)
}

export function loadMinecraftSpriteUrl(spriteFileName: string) {
  return spriteCatalog.loadUrl(spriteFileName)
}
