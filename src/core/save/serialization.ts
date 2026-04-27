import type {BlocklyWorkspaceData, ProjectSave, SerializationOptions} from "./types.ts"
import * as Blockly from "blockly";
import {useProjectConfigStore} from "../../stores";

export function serialize({ workspace }: SerializationOptions): ProjectSave {
  const blocklyWorkspace = Blockly.serialization.workspaces.save(workspace) as BlocklyWorkspaceData
  const projectConfig = useProjectConfigStore.getState().projectConfig

  return {
    version: 1,
    blocklyWorkspace,
    projectConfig
  }
}

export function deserialize({ save, workspace }: SerializationOptions & { save: ProjectSave }) {
  Blockly.serialization.workspaces.load(save.blocklyWorkspace, workspace)
  useProjectConfigStore.getState().replaceConfig(save.projectConfig)
}