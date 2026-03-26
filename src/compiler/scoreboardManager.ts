import { getProjectConfig } from './projectConfig'

class ScoreboardManager {
  private objectiveRegistered = false

  getObjectiveName(): string {
    const { namespace, noNameMangling } = getProjectConfig()
    return noNameMangling ? 'dpb_vars' : `__dpb_${namespace}_vars`
  }

  getVarName(name: string): string {
    const { namespace, noNameMangling } = getProjectConfig()
    return noNameMangling ? name : `$__dpb_${namespace}_${name}`
  }

  getTempVar(): string {
    const { namespace, noNameMangling } = getProjectConfig()
    return noNameMangling ? 'dpb_temp' : `$__dpb_${namespace}_$temp`
  }

  getInitializedVarName(): string {
    const { namespace, noNameMangling } = getProjectConfig()
    return noNameMangling ? 'dpb_initialized' : `$__dpb_${namespace}_initialized`
  }

  getObjectiveNamePublic(): string {
    return this.getObjectiveName()
  }

  withObjective(command: string): string {
    this.objectiveRegistered = true
    return command
  }

  reset() {
    this.objectiveRegistered = false
  }

  isObjectiveRegistered() {
    return this.objectiveRegistered
  }
}

export const scoreboardManager = new ScoreboardManager()