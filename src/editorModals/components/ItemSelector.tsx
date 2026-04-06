import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { loadMinecraftItemCatalog, loadMinecraftSpriteUrl } from '../../catalog/itemCatalog'
import type { MinecraftItemEntry } from '../../catalog/itemCatalog'
import './ItemSelector.css'

type ItemSelectorProps = {
  value: string
  onChange: (value: string) => void
  onResolvedChange?: (value: { value: string; spriteFileName: string }) => void
  columns?: number
  layout?: 'auto' | 'fill'
}

function getEntryByName(entries: readonly MinecraftItemEntry[], name: string) {
  return entries.find((entry) => entry.name === name) ?? null
}

function ItemSprite({ spriteFileName, large = false }: { spriteFileName: string; large?: boolean }) {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadMinecraftSpriteUrl(spriteFileName).then((nextSpriteUrl) => {
      if (!cancelled) {
        setSpriteUrl(nextSpriteUrl)
      }
    })

    return () => {
      cancelled = true
    }
  }, [spriteFileName])

  if (spriteUrl) {
    return (
      <img
        src={spriteUrl}
        alt=""
        className={`editorModalSpriteIcon${large ? ' editorModalSpriteIconLarge' : ''}`}
      />
    )
  }

  return (
    <div
      className={`editorModalSpriteIconPlaceholder${large ? ' editorModalSpriteIconPlaceholderLarge' : ''}`}
    />
  )
}

function ItemSelector({ value, onChange, onResolvedChange, layout = 'auto' }: ItemSelectorProps) {
  const [entries, setEntries] = useState<readonly MinecraftItemEntry[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const deferredValue = useDeferredValue(value)

  useEffect(() => {
    let cancelled = false

    loadMinecraftItemCatalog()
      .then((nextEntries) => {
        if (cancelled) return
        startTransition(() => {
          setEntries(nextEntries)
          setLoadError(null)
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Failed to load item list.'
        startTransition(() => {
          setLoadError(message)
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedValue = deferredValue.trim().toLowerCase()

  const filteredEntries = useMemo(() => {
    if (!entries) return []
    if (normalizedValue === '') return entries

    return entries.filter((entry) => entry.name.includes(normalizedValue))
  }, [entries, normalizedValue])

  const placeholderEntry = entries?.[0] ?? null
  const exactMatch = entries ? getEntryByName(entries, value.trim()) : null
  const selectedEntry = exactMatch ?? placeholderEntry

  function emitValueChange(nextValue: string) {
    onChange(nextValue)

    if (!onResolvedChange) return

    const nextMatch = entries ? getEntryByName(entries, nextValue.trim()) : null
    onResolvedChange({
      value: nextValue,
      spriteFileName: nextMatch?.spriteFileName ?? '',
    })
  }

  return (
    <div className={`itemSelector${layout === 'fill' ? ' itemSelectorFill' : ''}`}>
      <div className="editorModalControl editorModalFieldRow">
        {selectedEntry?.spriteFileName ? (
          <ItemSprite spriteFileName={selectedEntry.spriteFileName} large />
        ) : (
          <div
            className="editorModalSpriteIconPlaceholder editorModalSpriteIconPlaceholderLarge"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(event) => emitValueChange(event.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="editorModalInput editorModalInputBare"
          placeholder={placeholderEntry?.name ?? 'minecraft item'}
          spellCheck={false}
          autoComplete="off"
        />
        {value !== '' && (
          <button
            type="button"
            className="editorModalIconButton"
            onClick={() => emitValueChange('')}
            aria-label="Clear search"
          >
            <img src="/clear.svg" alt="" aria-hidden="true" />
          </button>
        )}
      </div>

      {isSearchFocused && (
        loadError ? (
          <div className="editorModalStatusPanel">{loadError}</div>
        ) : !entries ? (
          <div className="editorModalStatusPanel">Loading items...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="editorModalStatusPanel">No item matches. Save to keep a custom item name.</div>
        ) : (
          <div className={`itemSelectorList${layout === 'fill' ? ' itemSelectorListFill' : ''}`}>
            {filteredEntries.map((entry) => {
              const isActive = entry.name === value.trim()

              return (
                <button
                  key={entry.name}
                  type="button"
                  className={`itemSelectorEntry${isActive ? ' is-active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => emitValueChange(entry.name)}
                >
                  {entry.spriteFileName ? (
                    <ItemSprite spriteFileName={entry.spriteFileName} />
                  ) : (
                    <div className="editorModalSpriteIconPlaceholder" />
                  )}
                  <span className="itemSelectorEntryName">{entry.name}</span>
                </button>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

export default ItemSelector
