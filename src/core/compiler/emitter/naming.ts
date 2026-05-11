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

  variableObjectiveName() {
    return this.dpb('VARIABLES')
  }

  variableName(name: string) {
    return '$' + this.dpb(name)
  }

  procedureName(name: string) {
    return 'proc_' + name
  }

  procedureStorageName(name: string) {
    return `${this.internalNamespace()}:${this.procedureName(name)}_args`
  }

  procedureStoragePath(paramName: string) {
    return `${paramName}_args` // Not using quotes around paramName; macro syntax won't allow non-alphanumeric characters anyway
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