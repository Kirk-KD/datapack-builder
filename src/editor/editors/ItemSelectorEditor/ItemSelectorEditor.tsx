import {
  getMinecraftItemByName,
  loadMinecraftItemCatalog,
  type MinecraftItemEntry
} from '../../../catalog/itemCatalog.ts'
import type { EditorBaseProps } from '../../types.ts'
import {useState, useEffect, useRef} from 'react'
import ItemSprite from '../../components/ItemSprite.tsx'
import ItemSearchList from './ItemSearchList.tsx'
import {Box} from "@mui/material";
import TextInput from "../../components/TextInput.tsx";

const DEFAULT_ITEM = 'cobblestone'

export default function ItemSelectorEditor({state, setState}: EditorBaseProps<Record<string, unknown>, string>) {
  const [items, setItems] = useState<readonly MinecraftItemEntry[] | null>(null)
  const [searchString, setSearchString] = useState(DEFAULT_ITEM)
  const [selectedItemSrc, setSelectedItemSrc] = useState<string | null>(null)
  const [searchListVisible, setSearchListVisible] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const searchListAnchorRef = useRef<HTMLDivElement>(null)

  const selectItem = ({name, spriteFileName}: {name: string, spriteFileName: string | null}) => {
    setSearchString(name)
    setSelectedItemSrc(spriteFileName)
    setState({
      compiler: 'item',
      error: false,
      data: name,
    })
  }

  const setDefaultItem = () => {
    setSearchString(DEFAULT_ITEM)
    getMinecraftItemByName(DEFAULT_ITEM).then(item => {
      if (item) setSelectedItemSrc(item.spriteFileName)
    })
    setState({
      compiler: 'item',
      error: false,
      data: DEFAULT_ITEM,
    })
  }

  useEffect(() => {
    loadMinecraftItemCatalog().then(catalog => {
      setItems(catalog)
      if (state.data === undefined) setDefaultItem()
      else getMinecraftItemByName(state.data)
        .then(item => selectItem({
          name: state.data as string,
          spriteFileName: item?.spriteFileName ?? null
        }))
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
            getMinecraftItemByName(itemName).then(item => {
              selectItem({name: itemName, spriteFileName: item?.spriteFileName ?? null})
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
          onClickItem={({name, spriteFileName}) => {
            selectItem({name, spriteFileName})
            setSearchListVisible(false)
            inputRef.current?.blur()
          }}
        />
      </Box>
    </Box>
  )
}