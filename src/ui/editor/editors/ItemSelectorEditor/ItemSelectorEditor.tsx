import {
  getItemRegistry,
  getItemSpritePath
} from '../../../../core/minecraft'
import type { MinecraftRegistry } from '../../../../core/minecraft/registry'
import type { ItemEntry } from '../../../../core/minecraft'
import type { EditorBaseProps } from '../../../../core/editor'
import {useState, useEffect, useRef} from 'react'
import ItemSprite from '../../components/ItemSprite.tsx'
import ItemSearchList, {type ItemSearchEntry} from './ItemSearchList.tsx'
import {Box} from "@mui/material";
import TextInput from "../../components/TextInput.tsx";

const DEFAULT_ITEM = 'cobblestone'

export default function ItemSelectorEditor({state, setState}: EditorBaseProps<Record<string, unknown>, string>) {
  const [items, setItems] = useState<readonly ItemSearchEntry[] | null>(null)
  const [registry, setRegistry] = useState<MinecraftRegistry<ItemEntry> | null>(null)
  const [searchString, setSearchString] = useState(DEFAULT_ITEM)
  const [selectedItemSrc, setSelectedItemSrc] = useState<string | null>(null)
  const [searchListVisible, setSearchListVisible] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const searchListAnchorRef = useRef<HTMLDivElement>(null)

  const selectItem = ({name, spritePath}: {name: string, spritePath: string | null}) => {
    setSearchString(name)
    setSelectedItemSrc(spritePath)
    setState({
      compiler: 'item',
      error: false,
      data: name,
    })
  }

  const setDefaultItem = (nextRegistry: MinecraftRegistry<ItemEntry>) => {
    setSearchString(DEFAULT_ITEM)
    const hasDefault = nextRegistry.get(DEFAULT_ITEM)
    setSelectedItemSrc(hasDefault ? getItemSpritePath(DEFAULT_ITEM) : null)
    setState({
      compiler: 'item',
      error: false,
      data: DEFAULT_ITEM,
    })
  }

  useEffect(() => {
    getItemRegistry().then(nextRegistry => {
      setRegistry(nextRegistry)
      setItems(nextRegistry.getAll().map(id => ({
        name: id,
        spritePath: getItemSpritePath(id)
      })))
      if (state.data === undefined) setDefaultItem(nextRegistry)
      else {
        const itemName = state.data as string
        const hasItem = nextRegistry.get(itemName)
        selectItem({
          name: itemName,
          spritePath: hasItem ? getItemSpritePath(itemName) : null
        })
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!items) {
    return <div>Loading...</div>
  }

  return (
    <Box sx={{
      minWidth: '10rem',
      width: '20rem',
      p: 1
    }}>
      <Box ref={searchListAnchorRef}>
        <TextInput
          defaultValue={DEFAULT_ITEM}
          value={searchString}
          setValue={setSearchString}
          onChange={value => {
            const itemName = value.trim().toLowerCase()
            if (!itemName) {
              setSearchString(itemName)
              setSelectedItemSrc(null)
              setState({ ...state, error: true })
              return
            }
            const hasItem = registry?.get(itemName)
            selectItem({
              name: itemName,
              spritePath: hasItem ? getItemSpritePath(itemName) : null
            })
          }}
          onFocus={() => setSearchListVisible(true)}
          onBlur={() => setSearchListVisible(false)}
          ref={inputRef}
          startAdornment={<ItemSprite size={30} showSlot={true} src={selectedItemSrc}/>}
        />
      </Box>
      <Box sx={{
        position: 'relative',
        height: 'auto',
        width: '100%',
        overflow: 'visible'
      }}>
        <ItemSearchList
          items={items}
          searchString={searchString}
          open={searchListVisible}
          anchorEl={searchListAnchorRef}
          onClickItem={({name, spritePath}) => {
            selectItem({name, spritePath})
            setSearchListVisible(false)
            inputRef.current?.blur()
          }}
        />
      </Box>
    </Box>
  )
}