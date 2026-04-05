import * as Blockly from 'blockly'
import { openEditorModal } from '../../editorModals/bridge'

export type OpenEditorFieldOptions = {
  src: string
  width: number
  height: number
  editorType: string
  title?: string
  triggerData?: unknown
}

export class OpenEditorField extends Blockly.FieldImage {
  private readonly editorType_: string
  private readonly title_?: string
  private readonly triggerData_?: unknown

  constructor(options: OpenEditorFieldOptions) {
    super(options.src, options.width, options.height)

    this.editorType_ = options.editorType
    this.title_ = options.title
    this.triggerData_ = options.triggerData

    this.setOnClickHandler(() => {
      const sourceBlock = this.getSourceBlock()
      if (!(sourceBlock instanceof Blockly.BlockSvg)) return

      openEditorModal({
        editorType: this.editorType_,
        workspace: sourceBlock.workspace,
        blockId: sourceBlock.id,
        title: this.title_,
        trigger: {
          fieldName: this.name ?? undefined,
          data: this.triggerData_,
        },
      })
    })
  }
}
