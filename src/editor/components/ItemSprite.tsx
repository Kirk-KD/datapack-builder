import {Box} from "@mui/material";

type ItemSpriteProps = {
  src?: string | null
  size: number
  showSlot?: boolean
}

export default function ItemSprite({src, size, showSlot}: ItemSpriteProps) {
  const padding = showSlot ? 8 : 0
  return (
    <Box sx={{
      ...(showSlot ? {
        backgroundImage: 'url(inventory_slot.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      } : {}),
      width: size,
      height: size,
      imageRendering: 'pixelated',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {src && <img src={`src/data/minecraft/item_sprites/${src}`} width={size-padding} height={size-padding} alt={''}/>}
    </Box>
  )
}