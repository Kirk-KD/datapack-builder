import {registerBlockSpecs} from "./specs/blockRegistry.ts";
import {applyCategoryColours} from "./colours.ts";

export function setupToolbox() {
  applyCategoryColours()
  registerBlockSpecs()
}