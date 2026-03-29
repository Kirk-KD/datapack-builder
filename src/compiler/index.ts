import * as Blockly from 'blockly'
import './generator'
import { mcfunctionGenerator } from './generator'
import { registerBlockSpecGenerators } from '../blocks/specs/registry'
import { scoreboardManager } from './scoreboardManager'
import { resetContext } from './executeContext'
import { addFile, resetFiles, getFiles, prependToFile } from './fileRegistry'
import { getProjectConfig, getInternalNamespace } from './projectConfig'
import { resetIds } from './idGenerator'

registerBlockSpecGenerators((type, generator) => {
  mcfunctionGenerator.forBlock[type] = generator
})

function compileChain(block: Blockly.Block): string {
  const next = block.nextConnection?.targetBlock()
  // If a starting block has no "next", it should have children
  // Compile the block using the generator, the block will handle compilation of children
  if (!next) return mcfunctionGenerator.blockToCode(block) as string
  return mcfunctionGenerator.blockToCode(next) as string
}

export function compile(workspace: Blockly.WorkspaceSvg): Map<string, string> {
  resetFiles()
  resetIds()
  resetContext()

  const { packFormat, description } = getProjectConfig()
  const internalNs = getInternalNamespace()
  const obj = scoreboardManager.getObjectiveName()
  const initializedVar = scoreboardManager.getInitializedVarName()

  const topBlocks = workspace.getTopBlocks(true)
  let hasTick = false

  for (const block of topBlocks) {
    if (block.type === 'mc_on_load') {
      addFile(`data/${internalNs}/function/load.mcfunction`, compileChain(block))
    } else if (block.type === 'mc_on_tick') {
      hasTick = true
      addFile(
        `data/${internalNs}/function/tick.mcfunction`,
        `execute unless score ${initializedVar} ${obj} matches 1 run return\n`
        + compileChain(block)
      )
    } else if (block.type === 'procedures_defnoreturn') {
      addFile(
        `data/${internalNs}/function/proc_${block.getFieldValue('NAME')}.mcfunction`,
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

export { mcfunctionGenerator }
