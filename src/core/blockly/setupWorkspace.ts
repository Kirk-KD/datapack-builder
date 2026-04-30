import * as Blockly from 'blockly'
import {blocks as procedureBlocks, unregisterProcedureBlocks} from '@blockly/block-shareable-procedures'
import {shadowBlockConversionChangeListener} from '@blockly/shadow-block-converter'
import DarkTheme from "@blockly/theme-dark";
import {
  ContinuousFlyout,
  ContinuousMetrics,
  ContinuousToolbox,
} from '@blockly/continuous-toolbox'
import {colours} from "./colours.ts"
import theme from "../../theme.ts"
import type {WorkspaceSvg} from "blockly";
import getToolboxContents from "./getToolboxContents.ts";
import {updateWorkspaceRegistry} from "./workspaceRegistry.ts";
import {variableRegistry} from "./registry";

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

function updateToolbox(workspace: WorkspaceSvg) {
  updateWorkspaceRegistry(workspace)
  workspace.updateToolbox({
    kind: 'categoryToolbox',
    contents: getToolboxContents(workspace)
  })
}

function setupChangeListener(workspace: Blockly.WorkspaceSvg) {
  workspace.addChangeListener((event) => {
    if (
      // Update toolbox and variable list whenever variables are modified
      event.type === Blockly.Events.VAR_CREATE ||
      event.type === Blockly.Events.VAR_DELETE ||
      event.type === Blockly.Events.VAR_RENAME ||
      // Update procedure list whenever procedures are modified
      event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.BLOCK_DELETE ||
      event.type === Blockly.Events.BLOCK_CHANGE
    ) updateToolbox(workspace)
  })
}

function injectWorkspace(workspaceDiv: HTMLDivElement) {
  return Blockly.inject(workspaceDiv, {
    toolbox: {
      kind: 'categoryToolbox',
      contents: getToolboxContents()
    },
    ...additionalOptions
  })
}

function setupWorkspace(workspace: Blockly.WorkspaceSvg) {
  // Toolbox behaviors
  Blockly.VerticalFlyout.prototype.getFlyoutScale = () => 0.7
  // Do not override width of mutator flyouts
  const originalGetWidth = Blockly.VerticalFlyout.prototype.getWidth
  Blockly.VerticalFlyout.prototype.getWidth = function() {
    const workspace = this.getWorkspace()
    const targetWorkspace = workspace.targetWorkspace
    return targetWorkspace?.internalIsMutator ? originalGetWidth.call(this) : 300
  }

  // Load built-in procedure blockly
  unregisterProcedureBlocks()
  Blockly.common.defineBlocks(procedureBlocks)
  // Remove unwanted loaded procedure blockly
  delete Blockly.Blocks['procedures_callreturn']
  delete Blockly.Blocks['procedures_defreturn']
  delete Blockly.Blocks['procedures_ifreturn']

  // Enable auto shadow conversion
  workspace.addChangeListener(shadowBlockConversionChangeListener)

  // Initial placeholder variable
  workspace.getVariableMap().createVariable('myVar', 'mc_scoreboard_variable')
  updateToolbox(workspace)

  workspace.registerButtonCallback('CREATE_VARIABLE', () => {
    variableRegistry.add(variableRegistry.createEntry(prompt('Var name?') || 'var', 'integer'))
  })
  setupChangeListener(workspace)
}

export {setupWorkspace, injectWorkspace}
