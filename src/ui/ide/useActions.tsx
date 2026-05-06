import {useIDEContext} from './context/useIDEContext.ts'
import {useShowAlert} from './AlertSnackbar'
import {loadProject, newProject, saveProject} from '../../core/save'
import {controller} from '../editor'
import {TextDialogue} from './WorkspaceDialogues'
import {orchestrate, type OutputFiles} from '../../core/compiler'
import {mapToOutputZip} from '../../core/output-preview'
import {useProjectConfigStore} from '../../stores'

export function useActions() {
  const ideContext = useIDEContext()
  const showAlert = useShowAlert()

  function buildOutputFiles() {
    let outputFiles

    try {
      outputFiles = orchestrate(ideContext.blocklyWorkspaceRef.current!, useProjectConfigStore.getState().projectConfig)
      showAlert('Datapack built.', 'success')
    } catch (e) {
      showAlert('Error building datapack.', 'error')
      throw e
    }

    return outputFiles
  }

  return {
    saveProject() {
      if (!ideContext.blocklyWorkspaceRef.current) return
      saveProject({workspace: ideContext.blocklyWorkspaceRef.current})
      ideContext.setHasUnsavedFileChanges(false)
      showAlert('Project saved', 'success')
    },
    openProject() {
      controller.openEditorModal({
        title: 'Unsaved changes',
        editor: (
          <TextDialogue>
            Unsaved changes will be lost when another project is opened. Proceed?<br/>
            Save changes to your computer with <b>File {'>'} Save</b>.
          </TextDialogue>
        ),
        mode: 'confirm',
        onConfirm: () => {
          if (!ideContext.blocklyWorkspaceRef.current) return

          loadProject({workspace: ideContext.blocklyWorkspaceRef.current})
          ideContext.setHasUnsavedFileChanges(false)

          ideContext.setCompiledOutput(null)
          ideContext.setOutputViewerOpen(false)
        },
        noFullscreen: true
      })
    },
    newProject() {
      controller.openEditorModal({
        title: 'Unsaved changes',
        editor: (
          <TextDialogue>
            Unsaved changes will be lost when a new project is created. Proceed?<br/>
            Save changes to your computer with <b>File {'>'} Save</b>.
          </TextDialogue>
        ),
        mode: 'confirm',
        onConfirm: () => {
          if (!ideContext.blocklyWorkspaceRef.current) return

          newProject(ideContext.blocklyWorkspaceRef.current)
          ideContext.setHasUnsavedFileChanges(true)

          ideContext.setCompiledOutput(null)
          ideContext.setOutputViewerOpen(false)
          showAlert('New project created', 'success')
        },
        noFullscreen: true
      })
    },
    buildDatapack() {
      if (!ideContext.blocklyWorkspaceRef.current) return

      const outputFiles = buildOutputFiles()
      if (!outputFiles) return

      outputFiles.download(useProjectConfigStore.getState().projectConfig.namespace)

      viewOutputFiles(outputFiles, {
        setCompiledOutput: ideContext.setCompiledOutput,
        setOutputViewerOpen: ideContext.setOutputViewerOpen
      })
    },
    inspectOutput() {
      if (!ideContext.blocklyWorkspaceRef.current) return

      const outputFiles = buildOutputFiles()
      if (!outputFiles) return

      viewOutputFiles(outputFiles, {
        setCompiledOutput: ideContext.setCompiledOutput,
        setOutputViewerOpen: ideContext.setOutputViewerOpen
      })
    }
  }
}

function viewOutputFiles(
  outputFiles: OutputFiles,
  { setCompiledOutput, setOutputViewerOpen }: Pick<ReturnType<typeof useIDEContext>, 'setCompiledOutput' | 'setOutputViewerOpen'>
) {
  setCompiledOutput(mapToOutputZip(outputFiles.toStringMap(), new Date()))
  setOutputViewerOpen(true)
}
