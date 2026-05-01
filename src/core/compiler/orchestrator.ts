import * as Blockly from 'blockly'
import {generateDatapackIr} from './generator'
import {Emitter} from './emitter'
import {OutputFiles} from './outputFiles.ts'
import type {ProjectConfig} from '../../stores'

export function orchestrate(workspace: Blockly.WorkspaceSvg, projectConfig: ProjectConfig): OutputFiles {
  const datapackIr = generateDatapackIr(workspace)

  // TODO passes

  const outputFiles = new OutputFiles()
  const emitter = new Emitter(outputFiles, projectConfig)
  emitter.visitDatapack(datapackIr)

  return outputFiles
}