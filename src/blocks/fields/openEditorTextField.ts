import * as Blockly from 'blockly'
import { openEditorModal } from '../../editorModals/bridge'

export type OpenEditorTextFieldOptions = {
  text: string
  editorType: string
  title?: string
  triggerData?: unknown
}

export class OpenEditorTextField extends Blockly.FieldLabelSerializable {
  private readonly editorType_: string
  private readonly title_?: string
  private readonly triggerData_?: unknown

  constructor(options: OpenEditorTextFieldOptions) {
    super(options.text)

    this.EDITABLE = true
    this.editorType_ = options.editorType
    this.title_ = options.title
    this.triggerData_ = options.triggerData
  }

  override initView() {
    super.initView()
    this.applyTextStyle_()
  }

  override applyColour() {
    super.applyColour()
    this.applyTextStyle_()
  }

  protected override showEditor_() {
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
  }

  private applyTextStyle_() {
    if (!this.textElement_) return

    this.textElement_.style.fill = 'var(--colour-text-primary)'
    this.textElement_.style.fontWeight = 'bold'
    this.textElement_.style.cursor = 'pointer'
  }
}
