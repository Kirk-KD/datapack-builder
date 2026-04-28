import {deserialize} from "./serialization.ts";
import type {WorkspaceSvg} from "blockly";
import {DEFAULT_SAVE} from "./constants.ts";

export function newProject(workspace: WorkspaceSvg) {
  deserialize({ save: DEFAULT_SAVE, workspace })
}