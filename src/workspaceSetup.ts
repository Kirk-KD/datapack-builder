import * as Blockly from 'blockly'
import {blocks as procedureBlocks, unregisterProcedureBlocks} from '@blockly/block-shareable-procedures'
import {shadowBlockConversionChangeListener} from '@blockly/shadow-block-converter'
import DarkTheme from "@blockly/theme-dark";
import {
  ContinuousFlyout,
  ContinuousMetrics,
  ContinuousToolbox,
  registerContinuousToolbox
} from '@blockly/continuous-toolbox'
import {colours} from "./blocks/blockColours.ts"
import theme from "./theme.ts"

const customTheme = Blockly.Theme.defineTheme('customDark', {
  base: DarkTheme,
  name: 'Custom',
  blockStyles: {
    procedure_blocks: {
      colourPrimary: colours.procedures.toString(),
    }
  },
  componentStyles: {
    workspaceBackgroundColour: theme.palette.background.default,
    toolboxBackgroundColour: theme.palette.background.default,
    toolboxForegroundColour: theme.palette.text.secondary,
    flyoutBackgroundColour: theme.palette.background.paper,
    flyoutForegroundColour: theme.palette.text.secondary,
    scrollbarColour: theme.palette.scroll.main,
    scrollbarOpacity: 0.5,
  },
  fontStyle: {
    family: theme.typography.fontFamily,
    weight: theme.typography.fontWeightMedium?.toString(),
    size: theme.typography.fontSize,
  }
})

const additionalOptions = {
  plugins: {
    flyoutsVerticalToolbox: ContinuousFlyout,
    metricsManager: ContinuousMetrics,
    toolbox: ContinuousToolbox,
  },
  theme: customTheme,
  renderer: 'custom_renderer',
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.8,
    maxScale: 2,
    minScale: 0.2,
    scaleSpeed: 1.2,
    pinch: true
  },
  grid: {
    spacing: 20,
    length: 3,
    colour: '#888',
    snap: true
  }
}

function setupWorkspace(workspace: Blockly.Workspace) {
  // Toolbox behaviors
  Blockly.VerticalFlyout.prototype.getFlyoutScale = () => 0.8
  // Do not override width of mutator flyouts
  const originalGetWidth = Blockly.VerticalFlyout.prototype.getWidth
  Blockly.VerticalFlyout.prototype.getWidth = function() {
    const workspace = this.getWorkspace()
    const targetWorkspace = workspace.targetWorkspace
    return targetWorkspace?.internalIsMutator ? originalGetWidth.call(this) : 350
  }

  // Load built-in procedure blocks
  unregisterProcedureBlocks()
  Blockly.common.defineBlocks(procedureBlocks)
  // Remove unwanted loaded procedure blocks
  delete Blockly.Blocks['procedures_callreturn']
  delete Blockly.Blocks['procedures_defreturn']
  delete Blockly.Blocks['procedures_ifreturn']

  // Enable auto shadow conversion
  workspace.addChangeListener(shadowBlockConversionChangeListener)
}

export {registerContinuousToolbox, setupWorkspace, additionalOptions}
