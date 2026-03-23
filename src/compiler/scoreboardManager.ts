import { appendToFile } from './fileRegistry'
import { getProjectConfig } from './projectConfig'

class ScoreboardManager {
  private objectiveName = '__dpb_vars'
  private objectiveRegistered = false
  private variablePrefix = '$__dpb_'
  private tempVariableName = this.variablePrefix + '$temp'

  getVarName(name: string): string {
    return `${this.variablePrefix}${name}`
  }

  getTempVar(): string {
    return this.tempVariableName
  }

  getObjectiveName(): string {
    return this.objectiveName
  }

  withObjective(command: string): string {
    if (!this.objectiveRegistered) {
      this.objectiveRegistered = true
      const { namespace } = getProjectConfig()
      appendToFile(`data/${namespace}/function/load.mcfunction`, `scoreboard objectives add ${this.objectiveName} dummy\n`)
    }
    return command
  }

  reset() {
    this.objectiveRegistered = false
  }
}

export const scoreboardManager = new ScoreboardManager()