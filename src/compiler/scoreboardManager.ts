import { getProjectConfig } from './projectConfig'

class ScoreboardManager {
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
}

export const scoreboardManager = new ScoreboardManager()