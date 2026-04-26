import {resetIds} from "./idGenerator.ts";
import {addFile, getFiles, prependToFile, resetFiles} from "./fileRegistry.ts";
import {useProjectConfigStore} from "../../stores";
import * as Blockly from "blockly";
import {getInitializedVarName, getInternalNamespace, getObjectiveName, getProcName} from "./nameManager.ts";
import {bootstrapCompiler} from "./bootstrap.ts";
import {mcfunctionGenerator} from "./blockly/generator.ts";

function compileChain(block: Blockly.Block): string {
  const next = block.nextConnection?.targetBlock()
  // If a starting block has no "next", it should have children
  // Compile the block using the generator, the block will handle compilation of children
  if (!next) return mcfunctionGenerator.blockToCode(block) as string
  return mcfunctionGenerator.blockToCode(next) as string
}

export function compile(workspace: Blockly.WorkspaceSvg): Map<string, string> {
  bootstrapCompiler()
  resetFiles()
  resetIds()

  const {projectConfig} = useProjectConfigStore.getState()
  const { packFormat, description } = projectConfig
  const internalNs = getInternalNamespace()
  const obj = getObjectiveName()
  const initializedVar = getInitializedVarName()

  const topBlocks = workspace.getTopBlocks(true)
  let hasTick = false

  for (const block of topBlocks) {
    if (block.type === 'mc_on_load') {
      addFile(`data/${internalNs}/function/load.mcfunction`, compileChain(block))
    } else if (block.type === 'mc_on_tick') {
      hasTick = true
      addFile(
        `data/${internalNs}/function/tick.mcfunction`,
        `execute unless score ${initializedVar} ${obj} matches 1 run return fail\n`
        + compileChain(block)
      )
    } else if (block.type === 'procedures_defnoreturn') {
      addFile(
        `data/${internalNs}/function/${getProcName(block.getFieldValue('NAME'))}.mcfunction`,
        compileChain(block)
      )
    }
  }

  prependToFile(
    `data/${internalNs}/function/load.mcfunction`,
    `scoreboard objectives add ${obj} dummy\n`
    + `scoreboard players set ${initializedVar} ${obj} 1\n`
  )
  addFile(
    'data/minecraft/tags/function/load.json',
    JSON.stringify({ values: [`${internalNs}:load`] }, null, 2)
  )

  if (hasTick) {
    addFile(
      'data/minecraft/tags/function/tick.json',
      JSON.stringify({ values: [`${internalNs}:tick`] }, null, 2)
    )
  }

  addFile('pack.mcmeta', JSON.stringify({
    pack: { pack_format: packFormat, description }
  }, null, 2))

  return getFiles()
}