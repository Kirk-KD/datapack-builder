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
import {MetricsManager} from "blockly";

const customTheme = Blockly.Theme.defineTheme('customDark', {
  base: DarkTheme,
  name: 'Custom',
  blockStyles: {
    procedure_blocks: {
      colourPrimary: colours.procedures.toString(),
    }
  },
  fontStyle: {
    family: "Helvetica Neue",
    weight: "500",
    size: 12,
  }
})

class CustomContinuousMetrics extends ContinuousMetrics {
  override getViewMetrics(getWorkspaceCoordinates?: boolean): MetricsManager.ContainerRegion {
    const metrics = super.getViewMetrics(getWorkspaceCoordinates);
    // Decreasing view metrics height by 23 fixes the problem of the toolbox flyout and its contents being cut off at
    // the bottom, while still letting it fill the screen vertically.
    // The radius of the corners is 8px, so I'm not sure where this number comes from.
    metrics.height -= 21
    return metrics
  }
}

const additionalOptions = {
  plugins: {
    flyoutsVerticalToolbox: ContinuousFlyout,
    metricsManager: CustomContinuousMetrics,
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
