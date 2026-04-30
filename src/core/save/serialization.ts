import type {BlocklyRegistryData, BlocklyWorkspaceData, ProjectSave, SerializationOptions} from "./types.ts"
import * as Blockly from "blockly";
import {useProjectConfigStore} from "../../stores";
import {procedureRegistry, variableRegistry} from "../blockly/registry";

export function serialize({ workspace }: SerializationOptions): ProjectSave {
  const blocklyWorkspace: BlocklyWorkspaceData = Blockly.serialization.workspaces.save(workspace)
  const projectConfig = useProjectConfigStore.getState().projectConfig
  const blocklyRegistry: BlocklyRegistryData = {
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
  Blockly.serialization.workspaces.load(save.blocklyWorkspace, workspace)
  useProjectConfigStore.getState().replaceConfig(save.projectConfig)
  variableRegistry.replace(save.blocklyRegistry.variableEntries)
  procedureRegistry.replace(save.blocklyRegistry.procedureEntries)
}