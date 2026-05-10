import * as Blockly from 'blockly'
import {shadowBlockConversionChangeListener} from '@blockly/shadow-block-converter'
import DarkTheme from "@blockly/theme-dark";
import {
  ContinuousFlyout,
  ContinuousMetrics,
  ContinuousToolbox,
} from '@blockly/continuous-toolbox'
import {colours} from "./colours.ts"
import theme from "../../theme.ts"
import getToolboxContents from "./getToolboxContents.ts";
import {procedureRegistry, variableRegistry} from "./registry";
import {subscribeListeners} from "./specs/categories/procedures.ts";
import type {WorkspaceCallbacks} from './workspaceCallbacks.ts'

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

function injectWorkspace(workspaceDiv: HTMLDivElement) {
  return Blockly.inject(workspaceDiv, {
    toolbox: {
      kind: 'categoryToolbox',
      contents: getToolboxContents()
    },
    ...additionalOptions
  })
}

function setupWorkspace(workspace: Blockly.WorkspaceSvg, callbacks: WorkspaceCallbacks) {
  // Toolbox behaviors
  Blockly.VerticalFlyout.prototype.getFlyoutScale = () => 0.7
  // Do not override width of mutator flyouts
  const originalGetWidth = Blockly.VerticalFlyout.prototype.getWidth
  Blockly.VerticalFlyout.prototype.getWidth = function() {
    const workspace = this.getWorkspace()
    const targetWorkspace = workspace.targetWorkspace
    return targetWorkspace?.internalIsMutator ? originalGetWidth.call(this) : 300
  }

  // Enable auto shadow conversion
  workspace.addChangeListener(shadowBlockConversionChangeListener)

  // TODO fix
  // workspace.addChangeListener(shadowBlockRevokeListener)

  workspace.registerButtonCallback('CREATE_VARIABLE', () => {
    callbacks.onCreateVariable(({ name, valueType }) => {
      variableRegistry.add(variableRegistry.createEntry(name, valueType))
    })
  })

  workspace.registerButtonCallback('CREATE_PROCEDURE', () => {
    callbacks.onCreateProcedure(({ name, params }) => {
      procedureRegistry.addProcedure(
        name, params.map(({ name, type }) => procedureRegistry.createParameter(name, type))
      )
    })
  })

  const unsubProcListeners = subscribeListeners(workspace)

  return () => {
    unsubProcListeners()
  }
}

export {setupWorkspace, injectWorkspace}
