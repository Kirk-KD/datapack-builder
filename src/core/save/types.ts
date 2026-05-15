import type {ProjectConfig} from "../../stores";
import Blockly from "blockly";
import type {
  ConstantRegistryEntry,
  ProcedureRegistryEntry,
  VariableRegistryEntry,
} from "../blockly/registry";

export type BlocklyWorkspaceData = { [p: string]: unknown }

export type BlocklyRegistryData = {
  constantEntries: ConstantRegistryEntry[]
  variableEntries: VariableRegistryEntry[]
  procedureEntries: ProcedureRegistryEntry[]
}

export interface ProjectSave {
  version: number
  blocklyWorkspace: BlocklyWorkspaceData
  blocklyRegistry: BlocklyRegistryData
  projectConfig: ProjectConfig
}

export type SerializationOptions = {
  workspace: Blockly.WorkspaceSvg
}