import {registerBlockSpecs} from "./specs/registry.ts";
import {applyCategoryColours} from "./colours.ts";

export function setupToolbox() {
  applyCategoryColours()
  registerBlockSpecs()
}