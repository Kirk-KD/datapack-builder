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
    return this.dpb(this.projectConfig.namespace)
  }

  initializedFlagName() {
    return this.dpb('FLAG_INIT')
  }

  nextId(name: string) {
    return `${name}_${this.counter++}`
  }

  // DPB-ify a name
  dpb(name: string) {
    return this.projectConfig.noNameMangling ? name : `__dpb_${this.projectConfig.namespace}_${name}`
  }
}