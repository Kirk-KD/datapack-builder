import './ItemSearchList.css'
import ItemSprite from "../../components/ItemSprite.tsx";
import type {MinecraftItemEntry} from "../../../catalog/itemCatalog.ts";
import {memo, useMemo, useRef} from "react";
import { useVirtualizer } from '@tanstack/react-virtual'

const ItemEntry = memo(({ name, src, onClick }: { name: string, src: string, onClick: (item: MinecraftItemEntry) => void }) => {
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
})

type ItemSearchListProps = {
  items: readonly MinecraftItemEntry[]
  onClickItem: (item: MinecraftItemEntry) => void
  visible: boolean
  searchString: string
}

export default function ItemSearchList({items, onClickItem, visible, searchString}: ItemSearchListProps) {
  const filtered = useMemo(() =>
      items.filter(({name}) => !searchString || name.startsWith(searchString)),
    [items, searchString]
  )

  const scrollRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 45,
    measureElement: element => element.getBoundingClientRect().height
  })

  return (
    <div className={'itemSearchList'} style={visible ? {} : {display: 'none'}}>
      <div ref={scrollRef} style={{ height: 300, overflowY: 'auto', zIndex: 99999 }}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative', zIndex: 99999 }}>
          {virtualizer.getVirtualItems().map(virtualItem => {
            const { name, spriteFileName } = filtered[virtualItem.index]
            return (
              <div
                key={name}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  zIndex: 99999
                }}
              >
                <ItemEntry name={name} src={spriteFileName} onClick={onClickItem} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}