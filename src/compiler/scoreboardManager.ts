import { getProjectConfig } from './projectConfig'

class ScoreboardManager {
  private objectiveRegistered = false

  getObjectiveName(): string {
    const { namespace } = getProjectConfig()
    return `__dpb_${namespace}_vars`
  }

  getVarName(name: string): string {
    const { namespace } = getProjectConfig()
    return `$__dpb_${namespace}_${name}`
  }

  getTempVar(): string {
    const { namespace } = getProjectConfig()
    return `$__dpb_${namespace}_$temp`
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