import * as Blockly from 'blockly'

class CustomRenderer extends Blockly.zelos.Renderer {
  constructor() {
    super('custom_renderer')
  }

  protected makeConstants_(): Blockly.zelos.ConstantProvider {
    const provider = super.makeConstants_()

    provider.FIELD_BORDER_RECT_X_PADDING = 6
    provider.FIELD_BORDER_RECT_Y_PADDING = 6

    provider.DUMMY_INPUT_MIN_HEIGHT = 16
    provider.DUMMY_INPUT_SHADOW_MIN_HEIGHT = 10

    provider.TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT = 2
    provider.BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT = 12

    provider.NOTCH_HEIGHT = 6
    provider.NOTCH_WIDTH = 24

    return provider
  }
}

Blockly.blockRendering.register('custom_renderer', CustomRenderer)