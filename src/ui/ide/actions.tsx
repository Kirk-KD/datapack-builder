/**
 * Collection of repeated actions done in the IDE from multiple sources (e.g. MenuBar buttons doing the same thing as a
 * keyboard shortcut).
 */

import {loadProject, newProject, saveProject} from '../../core/save'
import type {IDEContextValue} from './context/IDEContext.tsx'
import {controller} from '../editor'
import {TextDialogue} from './WorkspaceDialogues'

export const actions = {
  saveProject({ blocklyWorkspaceRef, setHasUnsavedFileChanges }: IDEContextValue) {
    if (!blocklyWorkspaceRef.current) return
    saveProject({workspace: blocklyWorkspaceRef.current})
    setHasUnsavedFileChanges(false)
  },
  openProject({ blocklyWorkspaceRef, setHasUnsavedFileChanges }: IDEContextValue) {
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
      },
      noFullscreen: true
    })
  },
  newProject({ blocklyWorkspaceRef, setHasUnsavedFileChanges }: IDEContextValue) {
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
      },
      noFullscreen: true
    })
  }
}
