# Roadmap

## Vision

This project is a web-based IDE for creating Minecraft datapacks.
It provides a visual block programming environment with multiple abstraction layers.
The goal is to let users build datapack behavior safely and productively without requiring deep command syntax knowledge for every task.
The project solves the issue of mcfunction code lacking intuitive program flow control.
The IDE will eventually support not just mcfunction logic, but broader datapack project features such as metadata and imported assets.

## Product Model
- Web-based IDE
- Blockly block code workspace
- High-level layer: programming-style abstractions, hides underlying Minecraft mechanics
- Native layer: interface to Minecraft mechanics, with added validation and ergonomic wrappers
- Compilation/export pipeline
- Project configuration

## Layer Design

### High-Level Layer

The high-level layer implements basic programming language features missing in Minecraft's mcfunction files.
Example features: variables, conditional execution (if/else), loops, procedures with parameters, pre-compilation type checking.

The user should not need to worry about, nor have total control over, the underlying Minecraft mechanics used to realize such abstractions.
The user should be given some control over the compilation via a project configuration modal.

### Native Layer
The native layer acts as an interface for the user to control Minecraft-specific behaviours.
Example features: commands with type-checking, execute command wrapper, target selector wrapper, etc.

Validations for Minecraft-native commands and features should be implemented in this layer.
This layer can also provide ergonomic helpers for Minecraft construct creation, such as editors for otherwise tedious mcfunction coding (e.g. NBT, target selector filters, etc).
This also includes input blocks with validators and helpers, like string, int, number, and coordinates.

**Limits of abstraction:** Nothing that doesn't involve controlling Minecraft behaviour directly belongs in this layer.
In other words, the native layer only contains functionalities that direct Minecraft features.

### Raw Command Entry
Deferred for now.

## Design Principles
- High-level blocks express intent, not Minecraft implementation details.
- Native blocks expose Minecraft semantics, but with strong validation and UX support.
- The editor should prevent invalid structures where possible.

## Editor Modal System
The editor modal system exists to support block fields whose value is too complex or too awkward to edit inline.
It should stay small and block-driven rather than becoming a separate application state layer.

Each block that wants a modal editor exposes two functions:
- `getEditorContext`, which returns the current structured value for the editor
- `applyEditorResult`, which accepts the editor output and stores it back on the block

The modal host only manages generic concerns:
- open/close lifecycle
- lazy loading of editor components by `editorType`
- passing block context into the editor
- collecting a pending result and committing it on save

This keeps the ownership boundaries clear.
The modal host does not know what an item stack, selector, or NBT value means.
The block remains the owner of its own state shape and compilation behaviour.
The editor component is only responsible for editing a structured value and emitting the next structured value.

This design is intentionally simple:
- one shared host
- one registry for editor components
- one bridge for opening a modal from a Blockly field
- no global editor store
- no editor-specific persistence outside block extra state

The result is that modal editors are reusable UI helpers for complex native-layer values, not an independent document model.

## Item Component Editor System
The item component editor is designed as a schema-driven React component used inside the item stack editor, not as its own top-level modal.
This is important because item components are part of a larger `mc_item_stack` value alongside the selected item id and sprite preview.

The system is split into a few narrow responsibilities:
- a data component schema catalog in `src/catalog/`, which lazy-loads the generated component schema JSON
- a `DataComponentEditor`, which loads schemas and renders the component editing UI
- a `ComponentListEditor`, which manages the list of chosen components for one item
- a recursive `SchemaValueEditor`, which renders a value editor from schema nodes
- a small set of field editors for scalar and reference-like schema types

The main design choice is that editors are created per schema node kind, not per Minecraft component.
There should not be a handwritten React editor for every item component.
Instead, each component schema describes its value shape, and the UI walks that schema recursively.

Supported schema node kinds are intentionally minimal:
- `scalar`
- `object`
- `list`
- `union`
- `reference`
- `opaque` as a fallback for imperfect schema entries

This keeps the system practical while the schema is still being refined.
If a component is parsed imperfectly, the editor should still render something editable instead of blocking the entire feature.

Validation is also intentionally minimal.
The editor should enforce only what the schema directly declares:
- primitive type shape
- `choices`
- `min`
- `max`
- `default`
- `description`

Descriptions are available through help tooltips rather than always-visible text, so the editor stays dense enough for real use.

For now, reference types are edited using generic text or JSON inputs where a fully specialized UI does not yet exist.
That keeps the system immediately usable without requiring a large up-front library of special-purpose editors.
More specific editors can be added later only where they materially improve usability.

## Data Types
Data types are key to Minecraft commands.
Blocks responsible for the definition and validation of these types are considered to be in the Native layer.
See https://minecraft.wiki/w/Argument_types. Basic literal data types such as int and string are not discussed here.

Elementary data types are defined as their own specific blocks whenever they are meaningfully reusable across commands.
Examples: `tilde_and_caret`, `tilde`, `caret`, `angle`, `pitch`, `swizzle`, `range`.
These blocks carry their own validation and compilation behaviour, and composite blocks should explicitly choose which elementary blocks they accept.

Composite data types will have their own blocks, built from elementary and/or literal data types.
For example, `mc_block_pos` would explicitly accept three `tilde_and_caret` inputs rather than attaching validators to generic inputs.

Complex data types will have complete block-systems or dedicated editors that act as helpers for the user.
Example: Target Selectors, NBT Tags, Predicates.
These are still considered data types, since they are reusable structured definitions within the workspace and correspond to Minecraft argument types.
Special complex data types may receive explicit presets or editors instead of a block-system where the domain is too large or context-sensitive.
For example, NBT Tags used in Target Selectors have different keys depending on the entity type.

Elementary:
- Tilde-and-Caret
    - A tilde/caret, or a number, or a tilde/caret followed by a number
- Tilde
    - A tilde, or a number, or a tilde followed by a number
- Angle
    - [-180.0, 179.9]
    - Tilde notation
- Swizzle
    - Any non-repeating combination of the characters 'x', 'y', and 'z'

Composite:
- Block position
    - Three tilde-and-carets
    - As `mc_block_pos`
- Range
    - "a" for x=a
    - "a.." for x>=a
    - "..b" for x<=b
    - "a..b" for a<=x<=b
    - As `mc_range`
- Rotation
  - Yaw and Pitch
  - As `mc_rotation`

Complex:
- Target Selector
    - Reusable structured selector definition
- NBT
    - Reusable structured NBT definition/editor
- Predicate
    - Reusable structured predicate definition

## Procedures
Procedures are currently modeled as no-return reusable command chains.
Each procedure definition compiles to its own generated internal mcfunction file, and each call site emits a `function` call to that file.
Parameters are represented as explicit `mc_param` references inside the procedure body, and arguments at the call site are passed either inline for simple literal-like values or through temporary storage setup when indirection is needed.

For any block type accepted as an argument of a procedure, all inputs accepting that block type must also accept `mc_param`.

## Subsystem Status

### Main IDE Workspace `Not started`

### Code Editor (Blockly workspace) UX `In progress`

### File Output Preview UX `Not started`

### Block Definition System `In progress`

Complete:
- JSON-based block definition
- JSON-based toolbox category definition
- One object per block, handling its own definition, code generation, and any extensions

Incomplete:
- Migrate procedure blocks to custom system

### Validation System `In progress`

Complete:
- Attached to Blockly global validator, checks for invalid placement of blocks
- Policies made for different categories

Incomplete:
- Strict input validation for all blocks
- Centralized and more versatile validator policy creation

### Compiler/Emission Pipeline `In progress`

Complete:
- Compile from root blocks into file system representation

Incomplete:
- Zip file output
- Compile output optimization

### Project Configuration `Not started`

### Asset Import/Referencing `Not started`

### Project Create/Save/Load `Not started`

### Documentation `Not started`

### Testing `Not started`

### Execute Helper `In progress`
The `execute` block and sub-blocks is a native-layer feature to achieve the following behaviours not present or difficult to implement in Minecraft:
- An interface for complex execute parameters
- Multi-command and nested execute `run` code blocks

The code in the `run` stack should run once per every target selected by the `execute` command.
Since it supports multiple commands to be run, it requires a depth-first behaviour achieved by calling a function via `run function ...`.
For this, an internal mcfunction file will be generated at compile time, in which the execute context does not need to be prepended for each command.

Complete:
- Basic code generation
- Nested execute code context
- Modifier subcommands

Incomplete:
- Conditional subcommands
- Store subcommands

### Target Selector Helper `In progress`

Complete:
- Basic code generation
- Filter arguments

Incomplete:
- Filter argument blocks input validation
- Some argument blocks are only useful with certain base selectors

### NBT Helper `Not started`

### Minecraft Data Types `In progress`
