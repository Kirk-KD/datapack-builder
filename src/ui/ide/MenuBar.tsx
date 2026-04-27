import {AppBar, Stack, Toolbar} from "@mui/material";
import {MenuButton} from "./MenuButton.tsx";
import {loadProject, saveProject} from "../../core/save";
import * as React from "react";
import type {WorkspaceSvg} from "blockly";
import {ProjectNameDisplay} from "./ProjectNameDisplay.tsx";

export function MenuBar({ blocklyWorkspaceRef, hasUnsavedChanges }: { blocklyWorkspaceRef: React.RefObject<WorkspaceSvg | null>, hasUnsavedChanges: boolean }) {
  return (
    <AppBar color={'secondary'} position={'relative'}>
      <Toolbar variant={'dense'}>
        <ProjectNameDisplay hasUnsavedChanges={hasUnsavedChanges}/>

        <Stack direction={'row'}>
          <MenuButton text={'File'} items={[
            {
              text: 'Save',
              onClick: () => saveProject({ workspace: blocklyWorkspaceRef.current! })
            },
            {
              text: 'Load',
              onClick: () => loadProject({ workspace: blocklyWorkspaceRef.current! })
            },
            {
              text: 'New',
              onClick: () => alert('WIP') // TODO new project
            }
          ]}/>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}