import {applyCategoryColours, registerBlockSpecs} from "./specs/blockRegistry.ts";

export function setupToolbox() {
  applyCategoryColours()
  registerBlockSpecs()
}
