import * as Blockly from 'blockly'
import './fields.css'

export class TextButton extends Blockly.FieldLabel {
  private onClick_: () => void

  constructor(text: string, onClick?: () => void) {
    super(text)
    this.onClick_ = onClick || (() => {})
  }

  override initView() {
    super.initView()

    if (this.fieldGroup_) {
      Blockly.utils.dom.addClass(this.fieldGroup_, 'textButton')
    }
  }

  static fromJson(options: Record<string, unknown>): TextButton {
    const text = Blockly.utils.parsing.replaceMessageReferences(options['text'])
    return new TextButton(text)
  }

  protected override showEditor_() {
    this.onClick_()
  }

  setOnClick(onClick: () => void) {
    this.onClick_ = onClick
  }
}
