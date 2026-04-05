const spriteModuleLoaders = import.meta.glob('../../data/minecraft/item_sprites/*.png', {
  import: 'default',
}) as Record<string, () => Promise<string>>

export type MinecraftItemEntry = {
  name: string
  spriteFileName: string
}

let itemCatalogPromise: Promise<MinecraftItemEntry[]> | null = null
const spriteLoaderByFileName = new Map<string, () => Promise<string>>()
const spriteUrlCache = new Map<string, Promise<string | null>>()

for (const [modulePath, loadSpriteUrl] of Object.entries(spriteModuleLoaders)) {
  const fileName = modulePath.slice(modulePath.lastIndexOf('/') + 1)
  spriteLoaderByFileName.set(fileName, loadSpriteUrl)
}

export function loadMinecraftSpriteUrl(spriteFileName: string) {
  if (!spriteFileName) {
    return Promise.resolve(null)
  }

  const cached = spriteUrlCache.get(spriteFileName)
  if (cached) {
    return cached
  }

  const loadSpriteUrl = spriteLoaderByFileName.get(spriteFileName)
  if (!loadSpriteUrl) {
    const missingSprite = Promise.resolve(null)
    spriteUrlCache.set(spriteFileName, missingSprite)
    return missingSprite
  }

  const spriteUrlPromise = loadSpriteUrl().then((spriteUrl) => spriteUrl ?? null)
  spriteUrlCache.set(spriteFileName, spriteUrlPromise)
  return spriteUrlPromise
}

export function loadMinecraftItemCatalog() {
  if (itemCatalogPromise) {
    return itemCatalogPromise
  }

  itemCatalogPromise = import('../../data/minecraft/item_sprite_lookup.json').then(({ default: lookup }) => {
    return Object.entries(lookup).map(([name, spriteFileName]) => ({
      name,
      spriteFileName,
    }))
  })

  return itemCatalogPromise
}
