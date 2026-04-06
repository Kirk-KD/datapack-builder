# AGENTS.md

## Project map
- This is a Vite + React + TypeScript Blockly IDE for Minecraft datapacks.
- App boot is `src/main.tsx` → `src/App.tsx` → `src/components/WorkspacePanel.tsx`.
- Keep `src/workspaceSetup.ts` as the single place for Blockly plugins/theme/connection behavior.

## Core architecture
- Blockly blocks are registered from `src/blocks/index.ts`, which pulls in extensions, validators, renderer setup, and the toolbox categories.
- Each block lives as a `BlockSpec` in `src/blocks/specs/*.ts` and usually owns its JSON definition, init logic, and generator in one object.
- Dynamic toolbox contents depend on live workspace state via `src/compiler/workspaceRegistry.ts`.

## Compilation flow
- `src/compiler/index.ts` compiles top-level blocks into a `Map<string, string>` of datapack files.
- It emits `pack.mcmeta` plus `data/<namespace>/function/{load,tick}.mcfunction` and function tags under `data/minecraft/tags/function/`.
- Namespace/objective/temp names come from `src/compiler/nameManager.ts`; `noNameMangling` in `src/stores/projectConfig.ts` changes those outputs.

## Blockly conventions to preserve
- `WorkspacePanel.tsx` refreshes the toolbox when variables, procedures, or block structure changes; do not remove `updateWorkspaceRegistry(workspace)` before toolbox rebuilds.
- Procedure handling is split across `src/blocks/specs/procedures.ts` and `src/compiler/generator.ts`; `mc_param` compiles to `$(param)` macros inside procedure bodies.
- Validators in `src/blocks/validators/` intentionally gate only specific connections, especially execute chains and selector filter chains.

## Modal editor system
- Complex fields open through `src/editorModals/bridge.ts` and are hosted by `src/editorModals/EditorModalHost.tsx`.
- Editors are lazy-registered in `src/editorModals/editors/index.ts` by `editorType`.
- Blocks own their editor state via `getEditorContext` / `applyEditorResult`; see `mc_item_stack` in `src/blocks/specs/constructs.ts` and `src/editorModals/editors/itemStackEditor.tsx`.

## Generated data and catalogs
- Minecraft reference data is loaded from `src/data/minecraft/` through `src/catalog/*.ts`.
- `import.meta.glob('../data/minecraft/item_sprites/*.png')` powers item sprite lookup in `src/catalog/itemCatalog.ts`.
- `src/catalog/dataComponentSchemaCatalog.ts` lazy-loads `src/data/minecraft/data_component_schema.json` for the item-component editor.

## Scripts
- The only Python script that may be run by an AI agent is `scripts/check_missing_item_sprites.py`.

## Developer workflow
- `npm run dev` starts the app, `npm run build` runs typecheck + production build, `npm run lint` checks the repo, and `npm run preview` serves the built app.
- There is no dedicated test suite in the repo; use build/lint plus manual workspace smoke-testing for changes.

## Useful examples
- Dynamic control/variable categories: `src/blocks/categories/control.ts` and `src/blocks/categories/variables.ts`.
- Complex native-layer blocks: `src/blocks/specs/selectors.ts`, `src/blocks/specs/execute.ts`, and `src/blocks/specs/constructs.ts`.
- Data-driven editors: `src/editorModals/components/dataComponents/*`.

