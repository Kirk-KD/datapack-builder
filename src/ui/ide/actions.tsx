/**
 * Collection of repeated actions done in the IDE from multiple sources (e.g. MenuBar buttons doing the same thing as a
 * keyboard shortcut).
 */

import {loadProject, newProject, saveProject} from '../../core/save'
import type {IDEContextValue} from './context/IDEContext.tsx'
import {controller} from '../editor'
import {TextDialogue} from './WorkspaceDialogues'
import {orchestrate, type OutputFiles} from '../../core/compiler'
import {mapToOutputZip} from '../../core/output-preview'
import {useProjectConfigStore} from '../../stores'

export const actions = {
  saveProject({ blocklyWorkspaceRef, setHasUnsavedFileChanges }: IDEContextValue) {
    if (!blocklyWorkspaceRef.current) return
    saveProject({workspace: blocklyWorkspaceRef.current})
    setHasUnsavedFileChanges(false)
  },
  openProject({ blocklyWorkspaceRef, setHasUnsavedFileChanges, setCompiledOutput, setOutputViewerOpen }: IDEContextValue) {
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
        if (!blocklyWorkspaceRef.current) return

        loadProject({workspace: blocklyWorkspaceRef.current})
        setHasUnsavedFileChanges(false)

        setCompiledOutput(null)
        setOutputViewerOpen(false)
      },
      noFullscreen: true
    })
  },
  newProject({ blocklyWorkspaceRef, setHasUnsavedFileChanges, setCompiledOutput, setOutputViewerOpen }: IDEContextValue) {
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
        if (!blocklyWorkspaceRef.current) return

        newProject(blocklyWorkspaceRef.current)
        setHasUnsavedFileChanges(true) // A new project is not yet saved to computer.

        setCompiledOutput(null)
        setOutputViewerOpen(false)
      },
      noFullscreen: true
    })
  },
  buildDatapack({ blocklyWorkspaceRef, setCompiledOutput, setOutputViewerOpen }: IDEContextValue) {
    if (!blocklyWorkspaceRef.current) return

    const outputFiles = orchestrate(
      blocklyWorkspaceRef.current, useProjectConfigStore.getState().projectConfig)

    // Replace namespace with readable name later
    outputFiles.download(useProjectConfigStore.getState().projectConfig.namespace)

    viewOutputFiles(outputFiles, { setCompiledOutput, setOutputViewerOpen })
  }
}

function viewOutputFiles(
  outputFiles: OutputFiles,
  { setCompiledOutput, setOutputViewerOpen }: Pick<IDEContextValue, 'setCompiledOutput' | 'setOutputViewerOpen'>
) {
  setCompiledOutput(mapToOutputZip(outputFiles.toStringMap(), new Date()))
  setOutputViewerOpen(true)
}
