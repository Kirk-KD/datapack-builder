import {DEFAULT_CONFIG} from "../../stores";
import type {ProjectSave} from "./types.ts";

export const VERSION = 1
export const DEFAULT_SAVE: ProjectSave = {
  version: 1,
  blocklyWorkspace: {},
  blocklyRegistry: {
    variableEntries: [],
    procedureEntries: []
  },
  projectConfig: DEFAULT_CONFIG
}