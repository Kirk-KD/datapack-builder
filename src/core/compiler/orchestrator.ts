import * as Blockly from 'blockly'
import {generateDatapackIr} from './generator'
import {Emitter} from './emitter'
import {LoweringPass} from './passes'
import {OutputFiles} from './outputFiles.ts'
import type {ProjectConfig} from '../../stores'
import {AnnotationPass} from './passes/annotation.ts'

export function orchestrate(workspace: Blockly.WorkspaceSvg, projectConfig: ProjectConfig): OutputFiles {
  const datapackIr = generateDatapackIr(workspace)

  // Passes
  const loweredIr = new LoweringPass(projectConfig).run(datapackIr)
  new AnnotationPass().visitDatapack(loweredIr)

  // Emission
  const outputFiles = new OutputFiles()
  const emitter = new Emitter(outputFiles, projectConfig)
  emitter.visitDatapack(loweredIr)

  return outputFiles
}
