import {
  getMinecraftItemByName,
  loadMinecraftItemCatalog,
  type MinecraftItemEntry
} from '../../../catalog/itemCatalog.ts'
import type { EditorBaseProps } from '../../types.ts'
import {useState, useEffect, useRef} from 'react'
import './ItemSelectorEditor.css'
import ItemSprite from '../../components/ItemSprite.tsx'
import ItemSearchList from './ItemSearchList.tsx'
import ResetButton from "../../components/ResetButton.tsx";

const DEFAULT_ITEM = 'cobblestone'

export default function ItemSelectorEditor({callback}: EditorBaseProps<Record<string, unknown>, unknown>) {
  const [items, setItems] = useState<readonly MinecraftItemEntry[] | null>(null)
  const [searchString, setSearchString] = useState(DEFAULT_ITEM)
  const [selectedItemSrc, setSelectedItemSrc] = useState<string | null>(null)
  const [searchListVisible, setSearchListVisible] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const selectItem = (name: string, spriteFileName: string | null) => {
    setSearchString(name)
    setSelectedItemSrc(spriteFileName)
    callback({
      error: false,
      data: name,
      compileValue: () => name
    })
  }

  const setDefaultItem = () => {
    setSearchString(DEFAULT_ITEM)
    getMinecraftItemByName(DEFAULT_ITEM).then(item => {
      if (item) setSelectedItemSrc(item.spriteFileName)
    })
    callback({
      error: false,
      data: DEFAULT_ITEM,
      compileValue: () => DEFAULT_ITEM
    })
  }

  useEffect(() => {
    loadMinecraftItemCatalog().then(catalog => {
      setItems(catalog)
      setDefaultItem()
    })
  }, [])

  if (!items) {
    return <div>Loading...</div>
  }

  return (
    <div className='itemSelectorEditor'>
      <div className='itemSelectorSearchContainer'>
        <ItemSprite size={30} showSlot={true} src={selectedItemSrc}/>
        <input
          ref={inputRef}
          value={searchString}
          onChange={e => {
            const itemName = e.target.value.trim().toLowerCase()
            if (!itemName) {
              setSearchString(itemName)
              setSelectedItemSrc(null)
              callback({ error: true })
              return
            }
            getMinecraftItemByName(itemName).then(item => {
              selectItem(itemName, item?.spriteFileName ?? null)
            })
          }}
          onFocus={() => setSearchListVisible(true)}
          onBlur={() => setSearchListVisible(false)}
        />
        <ResetButton handleReset={setDefaultItem}/>
      </div>

      <div className='itemSelectorListContainer'>
        <ItemSearchList items={items} searchString={searchString} visible={searchListVisible} onClickItem={({name, spriteFileName}) => {
          selectItem(name, spriteFileName)
          setSearchListVisible(false)
          inputRef.current?.blur()
        }} />
      </div>
    </div>
  )
}