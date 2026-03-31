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
import {colours} from "./blocks/blockColours.ts";

const customTheme = Blockly.Theme.defineTheme('customDark', {
  base: DarkTheme,
  name: 'Custom',
  blockStyles: {
    procedure_blocks: {
      colourPrimary: colours.procedures.toString(),
      colourSecondary: colours.procedures.toString(),
      colourTertiary: colours.procedures.toString()
    }
  },
  fontStyle: {
    family: "Helvetica Neue",
    weight: "500",
    size: 12,
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
    startScale: 1.0,
    maxScale: 2,
    minScale: 0.4,
    scaleSpeed: 1.2,
    pinch: true
  },
  grid: {
    spacing: 20,
    length: 3,
    colour: '#555',
    snap: true
  }
}

function setupWorkspace(workspace: Blockly.Workspace) {
  // Toolbox behaviors
  Blockly.VerticalFlyout.prototype.getFlyoutScale = () => 0.8
  Blockly.VerticalFlyout.prototype.getWidth = () => 350

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
