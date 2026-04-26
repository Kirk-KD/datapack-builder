export type AssetModuleLoaders = Record<string, () => Promise<string>>

export type AssetCatalog = {
  loadUrl: (assetId: string) => Promise<string | null>
}

export function createAssetCatalog(loaders: AssetModuleLoaders): AssetCatalog {
  const loaderByAssetId = new Map<string, () => Promise<string>>()
  const urlCache = new Map<string, Promise<string | null>>()

  for (const [modulePath, loadAssetUrl] of Object.entries(loaders)) {
    const assetId = modulePath.slice(modulePath.lastIndexOf('/') + 1)
    loaderByAssetId.set(assetId, loadAssetUrl)
  }

  return {
    loadUrl(assetId: string) {
      if (!assetId) {
        return Promise.resolve(null)
      }

      const cached = urlCache.get(assetId)
      if (cached) {
        return cached
      }

      const loadAssetUrl = loaderByAssetId.get(assetId)
      if (!loadAssetUrl) {
        const missingAsset = Promise.resolve(null)
        urlCache.set(assetId, missingAsset)
        return missingAsset
      }

      const assetUrlPromise = loadAssetUrl().then((assetUrl) => assetUrl ?? null)
      urlCache.set(assetId, assetUrlPromise)
      return assetUrlPromise
    },
  }
}
