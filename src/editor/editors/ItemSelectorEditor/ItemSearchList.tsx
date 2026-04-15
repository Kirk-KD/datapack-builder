import './ItemSearchList.css'
import ItemSprite from "../../components/ItemSprite.tsx";
import type {MinecraftItemEntry} from "../../../catalog/itemCatalog.ts";

function ItemEntry({ name, src, onClick }: { name: string, src: string, onClick: (item: MinecraftItemEntry) => void }) {
  return (
    <div
      className={'itemEntry'}
      onClick={() => onClick({name, spriteFileName: src})}
      onMouseDown={e => e.preventDefault()} // prevent input blur before click fires
    >
      <ItemSprite size={25} src={src}/>
      <span>{name}</span>
    </div>
  )
}

type ItemSearchListProps = {
  items: readonly MinecraftItemEntry[]
  onClickItem: (item: MinecraftItemEntry) => void
  visible: boolean
  searchString: string
}

export default function ItemSearchList({items, onClickItem, visible, searchString}: ItemSearchListProps) {
  return (
    <div className={'itemSearchList'} style={visible ? {} : {display: 'none'}}>
      {items
        .filter(({name}) => !searchString || name.startsWith(searchString))
        .map(({ name, spriteFileName }) => <ItemEntry name={name} src={spriteFileName} onClick={onClickItem} key={name}/>)}
    </div>
  )
}