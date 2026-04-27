import type {ProjectConfig} from "../../stores";
import Blockly from "blockly";

export type BlocklyWorkspaceData = { [p: string]: unknown }

export interface ProjectSave {
  version: number
  blocklyWorkspace: BlocklyWorkspaceData
  projectConfig: ProjectConfig
}

export type SerializationOptions = {
  workspace: Blockly.WorkspaceSvg
}