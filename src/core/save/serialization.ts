import type {BlocklyRegistryData, BlocklyWorkspaceData, ProjectSave, SerializationOptions} from "./types.ts"
import * as Blockly from "blockly";
import {DEFAULT_CONFIG, useProjectConfigStore} from "../../stores";
import {constantRegistry, procedureRegistry, variableRegistry} from "../blockly/registry";
import {states} from '../blockly'

export function serialize({ workspace }: SerializationOptions): ProjectSave {
  const blocklyWorkspace: BlocklyWorkspaceData = Blockly.serialization.workspaces.save(workspace)
  const projectConfig = useProjectConfigStore.getState().projectConfig
  const blocklyRegistry: BlocklyRegistryData = {
    constantEntries: constantRegistry.list(),
    variableEntries: variableRegistry.list(),
    procedureEntries: procedureRegistry.list()
  }

  return {
    version: 1,
    blocklyWorkspace,
    projectConfig,
    blocklyRegistry
  }
}

export function deserialize({ save, workspace }: SerializationOptions & { save: ProjectSave }) {
  states.deserializing = true

  constantRegistry.replace(save.blocklyRegistry.constantEntries ?? [])
  variableRegistry.replace(save.blocklyRegistry.variableEntries ?? [])
  procedureRegistry.replace(save.blocklyRegistry.procedureEntries ?? [])
  Blockly.serialization.workspaces.load(save.blocklyWorkspace ?? {}, workspace)

  useProjectConfigStore.getState().replaceConfig(save.projectConfig ?? DEFAULT_CONFIG)
}