import * as Blockly from 'blockly'

const PLACEHOLDER_SRC = '/item_placeholder.svg'
const BACKGROUND_SRC = '/inventory_slot.png'

const SIZE = 26
const MARGIN = 4

export class ItemSpriteField extends Blockly.FieldImage {
  private spriteSrc_: string
  private backgroundElement_: SVGImageElement | null = null

  constructor(initialSpriteSrc = PLACEHOLDER_SRC) {
    super(initialSpriteSrc, SIZE - 2 * MARGIN, SIZE - 2 * MARGIN)
    this.spriteSrc_ = initialSpriteSrc
  }

  override initView() {
    super.initView()

    if (!this.fieldGroup_ || !this.imageElement || this.backgroundElement_) return

    this.backgroundElement_ = Blockly.utils.dom.createSvgElement(
      'image',
      {
        x: -MARGIN,
        y: -MARGIN,
        width: SIZE,
        height: SIZE,
        'image-rendering': 'pixelated',
      },
      this.fieldGroup_,
    ) as SVGImageElement

    this.backgroundElement_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', BACKGROUND_SRC)

    if (this.spriteSrc_ !== PLACEHOLDER_SRC)
      this.imageElement.setAttribute('image-rendering', 'pixelated')
    this.fieldGroup_.insertBefore(this.backgroundElement_, this.imageElement)
  }

  setSpriteSource(spriteSrc?: string) {
    const nextSpriteSrc = spriteSrc || PLACEHOLDER_SRC
    if (nextSpriteSrc === this.spriteSrc_) return

    this.spriteSrc_ = nextSpriteSrc
    this.setValue(nextSpriteSrc)

    if (this.spriteSrc_ !== PLACEHOLDER_SRC && this.imageElement)
      this.imageElement.setAttribute('image-rendering', 'pixelated')

    const sourceBlock = this.getSourceBlock()
    if (sourceBlock?.rendered && sourceBlock instanceof Blockly.BlockSvg) {
      sourceBlock.render()
    }
  }
}
