import type {ProjectConfig} from '../../../stores'

export class Naming {
  readonly projectConfig: ProjectConfig
  private counter: number = 0

  constructor(projectConfig: ProjectConfig) {
    this.projectConfig = projectConfig
  }

  internalNamespace() {
    return this.dpb('internal')
  }

  internalMcfunctionFilePath(name: string) {
    return `data/${this.internalNamespace()}/function/${name}.mcfunction`
  }

  procedureMcfunctionFilePath(name: string) {
    return this.internalMcfunctionFilePath(`proc_${name}`)
  }

  variableObjectiveName() {
    return this.dpb('VARIABLES')
  }

  variableName(name: string) {
    return '$' + this.dpb(name)
  }

  procedureName(name: string) {
    return 'proc_' + name
  }

  initializedFlagName() {
    return this.variableName('FLAG_INIT')
  }

  nextId(name: string) {
    return `${name}_${this.counter++}`
  }

  // DPB-ify a name
  dpb(name: string) {
    return this.projectConfig.noNameMangling ? name : `__dpb_${this.projectConfig.namespace}_${name}`
  }
}