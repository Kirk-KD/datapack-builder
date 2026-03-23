import * as Blockly from 'blockly'
import './generator'
import './generators/commands'
import './generators/control'
import './generators/variables'
import { mcfunctionGenerator } from './generator'
import { scoreboardManager } from './scoreboardManager'
import { addFile, resetFiles, getFiles } from './fileRegistry'
import { getProjectConfig } from './projectConfig'

export function compile(workspace: Blockly.WorkspaceSvg): Map<string, string> {
  resetFiles()
  scoreboardManager.reset()

  const { namespace, packFormat, description } = getProjectConfig()

  const mainCode = mcfunctionGenerator.workspaceToCode(workspace)
  addFile(`data/${namespace}/function/main.mcfunction`, mainCode)
  addFile('pack.mcmeta', JSON.stringify({
    pack: { pack_format: packFormat, description }
  }, null, 2))

  return getFiles()
}