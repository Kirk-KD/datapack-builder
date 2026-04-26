import * as Blockly from 'blockly'

export type ToggleImageFieldOptions = {
  collapsedSrc: string
  expandedSrc: string
  width: number
  height: number
  collapsedAlt: string
  expandedAlt: string
  initialExpanded?: boolean
  onToggle?: (expanded: boolean, field: ToggleImageField) => void
}

export class ToggleImageField extends Blockly.FieldImage {
  private readonly collapsedSrc_: string
  private readonly expandedSrc_: string
  private readonly collapsedAlt_: string
  private readonly expandedAlt_: string
  private expanded_: boolean
  private readonly onToggle_?: (expanded: boolean, field: ToggleImageField) => void

  constructor(options: ToggleImageFieldOptions) {
    const initialExpanded = !!options.initialExpanded
    super(
      initialExpanded ? options.expandedSrc : options.collapsedSrc,
      options.width,
      options.height,
      initialExpanded ? options.expandedAlt : options.collapsedAlt,
    )

    this.collapsedSrc_ = options.collapsedSrc
    this.expandedSrc_ = options.expandedSrc
    this.collapsedAlt_ = options.collapsedAlt
    this.expandedAlt_ = options.expandedAlt
    this.expanded_ = initialExpanded
    this.onToggle_ = options.onToggle

    this.setOnClickHandler(() => {
      this.setExpanded(!this.expanded_)
      this.onToggle_?.(this.expanded_, this)
    })
  }

  isExpanded() {
    return this.expanded_
  }

  setExpanded(expanded: boolean) {
    this.expanded_ = expanded
    this.setValue(expanded ? this.expandedSrc_ : this.collapsedSrc_)
    this.setAlt(expanded ? this.expandedAlt_ : this.collapsedAlt_)
    this.rerenderSourceBlock_()
  }

  private rerenderSourceBlock_() {
    const sourceBlock = this.getSourceBlock()
    if (sourceBlock?.rendered && sourceBlock instanceof Blockly.BlockSvg) {
      sourceBlock.render()
    }
  }
}
