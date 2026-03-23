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
    if (this.objectiveRegistered) return command
    this.objectiveRegistered = true
    return `scoreboard objectives add ${this.objectiveName} dummy\n${command}`
  }

  reset() {
    this.objectiveRegistered = false
  }
}

export const scoreboardManager = new ScoreboardManager()