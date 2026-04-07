# Editor Modals

Editors for block-specific data (and potentially project-wide data) are hosted via modals.
The `EditorModalHost` component accepts an Editor component and renders it, while bubbling up its data.

An **Editor** is a React component that houses fields and sub-components (including potentially sub-Editors).
It is responsible for rendering the fields and bubbling up the data.

**Minecraft Data Component** editors are treated specially as their sub-components are generated via `data_component_schema.json`,
but they still need to respect the Editor responsibilities.


## `registry.ts`
This file defines the Editor component registry which registers all Editor components by id.
The id is used by the `reference` field in the Editor JSON schema to demand the creation of a sub-Editor Component.

## Structure
- Editors
  - String
  - Number
  - Integer
  - Boolean
  - Colour
  - Reference (specifies an editor via ID)
  - Object (renders a new set of schemas)
  - Item Stack (uses Item Selector and Data Component Editor)
  - Item Selector
  - Data Component

## Editor Props
- `context`: custom information providing context to the editor
- `onChange(value)`: lets parent receive data
- `schema`: the schema for this editor; used to generate child editors