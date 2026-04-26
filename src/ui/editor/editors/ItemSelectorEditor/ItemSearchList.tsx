import ItemSprite from "../../components/ItemSprite.tsx";
import type {MinecraftItemEntry} from "../../../../core/catalog";
import {memo, useMemo, useRef, useEffect} from "react";
import { useVirtualizer } from '@tanstack/react-virtual'
import {Box, Popper, Paper, Stack, Typography, ButtonBase} from "@mui/material";
import * as React from "react";

const ItemEntry = memo(({ name, src, onClick }: { name: string, src: string, onClick: (item: MinecraftItemEntry) => void }) => {
  return (
    <ButtonBase
      onClick={() => onClick({name, spriteFileName: src})}
      onMouseDown={e => e.preventDefault()}
      sx={{
        width: '100%',
        textAlign: 'left',
        '&:hover': {
          backgroundColor: 'action.hover',
        }
    }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: 1,
          width: '100%',
          boxSizing: 'border-box',
          alignItems: 'center',

        }}
      >
        <ItemSprite size={25} src={src}/>
        <Typography>{name}</Typography>
      </Stack>
    </ButtonBase>
  )
})

type ItemSearchListProps = {
  items: readonly MinecraftItemEntry[]
  onClickItem: (item: MinecraftItemEntry) => void
  open: boolean
  searchString: string
  anchorEl: React.RefObject<HTMLElement | null>
}

export default function ItemSearchList({items, onClickItem, open, searchString, anchorEl}: ItemSearchListProps) {
  const filtered = useMemo(() =>
      items.filter(({name}) => !searchString || name.startsWith(searchString)),
    [items, searchString]
  )

  const scrollRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 35,
    measureElement: element => element.getBoundingClientRect().height
  })

  useEffect(() => {
    virtualizer.measure()
  }, [filtered.length, open, virtualizer])

  return (
    <Popper
      open={open}
      anchorEl={anchorEl.current}
      placement="bottom-start"
      sx={{
        zIndex: 99999,
      }}
    >
      <Paper
        sx={{
          width: anchorEl ? `${anchorEl.current?.clientWidth}px` : '100%',
          maxHeight: '25rem',
          overflow: 'hidden',
        }}
      >
        {filtered.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>No items found</Typography>
          </Box>
        ) : (
          <Box
            ref={scrollRef}
            sx={{
              maxHeight: '25rem',
              overflowY: 'auto',
              width: '100%'
            }}
          >
            <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              {virtualizer.getVirtualItems().map(virtualItem => {
                const { name, spriteFileName } = filtered[virtualItem.index]
                return (
                  <Box
                    key={name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <ItemEntry name={name} src={spriteFileName} onClick={onClickItem} />
                  </Box>
                )
              })}
            </Box>
          </Box>
        )}
      </Paper>
    </Popper>
  )
}