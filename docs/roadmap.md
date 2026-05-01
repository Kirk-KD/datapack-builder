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

## Editor System
The editor system provides an interface for the user to certain block properties, such as an Item Stack Editor.
They are intended to be opened via a clickable field on a Blockly block, but the implementation should allow
future access outside a Blockly workspace and blocks.

### Data
The core of the Editor system relies on data being returned bottom-up, with context passed top-down.
This is due to the nested and potentially recursive nature of an Editor, where it is made up of nested Editors and elementary input fields.

For ease of design, the following will all be considered Editor input fields:
- String input
- Numeric input
- Object input
- List input
- Colour picker
- Item selector
- Data Component editor
- etc.

There should be two unified type definitions, `EditorContext` and `EditorState`.

The `EditorContext` provides at least the Editor source (e.g. a Blockly block instance), to Editors.
It should be extended via generics (`EditorContext<{key: ValueType}>`) in specific Editors to include other relevant information, such as the Item Selector associated with a Data Modifier Editor.
It is the responsibility of the source to provide the initial context (e.g. a Blockly block informing its opened Editor of its identity).
It is the responsibility of the parent Editor to provide its inner Editors necessary information (e.g. a Projectile Editor informing its inner Item Stack Editor of the whitelisted projectile items).
The behaviour of conditionally disabled input fields is achieved via this system too.

The `EditorState` will be the argument type for a callback function, likely a React `useState` state setter, to pass user-entered data and Editor state up to the Editor source to be used or saved.
The principle behind Editor States is serializability, where the outputted State can be used to reopen the same Editor containing the same values.
It should have at least three fields: `compiler`, `error`, and `data`. The `data` can be any type, either primitive or an object.
`Error` is a boolean flag that marks the user input of a particular Editor as erronous, and the UX should reflect this information.
`Compiler` indicates the compiler type (e.g. `scalar`, `list`, `item_stack`) used to by the Editor State Compiler.

### Editor State Compiler
An Editor State Compiler receives an Editor State and an options object and converts the State to a string of code.
The compiled code may vary depending on options passed to the compiler.
For example, the `data` returned by an Editor could be

```
{
  id: 'minecraft:egg',
  components: [
    {
      'minecraft:chicken/variant': {
        'variant': 'cold'
      }
    }
  ],
  count: 16,
  spriteSrc: 'egg.png'
}
```

But its compiler function should return either:

```'minecraft:egg[minecraft:chicken/variant="cold"] 16'```

or:

```'{id:"minecraft:egg",components:{"minecraft:chicken/variant":"cold"},count:16}'```

depending on the option specifying whether SNBT mode is used.

### UI / UX

#### Editor
All inputs of an Editor should have a two-column design: field labels in the left column, and inputs/inner Editors in the right one.
The label column should be left aligned and take up the minimum width needed to display the longest label, plus some margin.
The input column should at least fill the remaining horizontal space and expand respect any width demands by its inner inputs and Editors.

Notice how an inner Editor could encounter overflow too. An inner Editor should never have its own horizontal scrollbar.
Instead, the root editor should satisfy its content's width requirement by increasing its own width and letting its parent handle horizontal scroll behaviours.

To avoid elementary input components gaining width infinitely due to nested Editors and to ensure correct alignment, the same `max-width` must be defined for them.
To facilitate horizontal overflow of the root Editor, a `min-width` must also be defined similarly.

Each elementary input component (and not inner Editors) requires a "reset" button.
Consequently, a default value must be defined for each input.

Each input component must also allow for an optional `description` and `note`.
Descriptions will be displayed via a tooltip component upon hovering over the input's label.
A note will be displayed as muted text above the input component, if provided.

Each input component must also allow a specification of it being `optional`.
An optional input field will have a checkbox to the left of its label.
If an input is optional, the checkbox is by default unchecked.
When the checkbox is unchecked, the input component is disabled and greyed out.
The disabled status of an input element must be reported via the `EditorResult` pipeline.
Upon disabling, the input's value (or values if it is an inner Editor) must be kept and not reset.
By default, an input component is not optional.
This optional input toggle avoids the need to implement an "unset" value/option for each input type.

Any inner Editor input must be collapsable, including list Editors.
Upon collapsing or expanding, the parent/root Editor must adjust its width responsively under the new layout.
The initial `collapsed` state can be specified via a prop, or defaults to false.

> Collapsed state deferred for now.

A visual container is used around a nested Editor to separate it from the other input elements.
This means the root editor should not be wrapped in a container (unless otherwise needed).
The value of the container background colour should rotate through (and wrap around) three light to dark variants depending on its nested depth.
This visual container should not be applied to list editors.

It is the responsibility of the Editor host (e.g. a modal containing this editor, or a Settings page) to
provide a save/cancel functionality and to delete or reset the Editor appropriately.

#### String Input
Simply a text input with the option to be a text field.

#### Number Input
A text input with a validator that runs on every keystroke.
The validator does not correct the input, but the input component should set the `error` flag of the `EditorResult`.

A min and max can be specified.

#### Object Input
Essentially an empty Editor able to take in inputs components as children.
`key` props will be the label texts for inner inputs in the Object input.
It will return data as an Object with keys being the value of the `key` props of its children.

#### List Input
A list input is an Editor that has a predetermined item Editor type.

> At this time, no minimum or maximum list size needs to be specified.

#### Dropdown
A dropdown of string values. If the number of options is greater than 25, there should be a small search/filter textbox.
A default value can optionally be explicitly defined, otherwise it treats the first option as the default.

#### Boolean
Simply a checkbox with the text "true" or "false" to the right of it.

#### Keyboard Navigation
> Deferred for now. Need an App-wide unified design.

### Schema
A schema JSON object can be used to create Editors.
A parser should receive an Editor schema object and return the recursively constructed Editor/input components.
For example, this facilitates the dynamically loaded Item Stack data component editors from `data_component_schema.json`.

#### Editor Lookup
A `reference`-kind schema simply provides the ID of the editor, and the corresponding Editor will be created by the parser.

### Editor Saving/Loading
Regardless of the format an Editor's result is in, it should be able to load back the exact same value and state when given the same result and context.
For example, an Item Stack Editor should be able to accept its own result data and populate itself and its inner Editors.
As such, consumers of an Editor intending to save and load its data must keep the whole Editor State instead of only `data`, in most cases.

## Blockly Workspace Registry System
The Blockly Workspace Registry system is the source-of-truth for variables, procedures/functions, and parameters,
each of which will have one `Registry`.

A `Registry` holds an array of `RegistryEntries`. The `RegistryEntry` can be any type.

The `Registry` should provide methods to add, remove, list, filter, or find an entry/entries.

### Variables
Variables will have strict types. This is because different value types require different methods of representation at runtime.

#### Integer
Integers are stored as a scoreboard "player". E.g. `scoreboard players set int_var VARIABLES 1` sets `int_var` to `1` under the `VARIABLES` objective.

#### Float
Floats can be stored in the scoreboard using fixed-point arithmetic, but would require additional supporting operations before and after the intended operation.

#### Boolean
Booleans are the same as integers.

#### String
> Deferred for now

### Procedures
Procedures have no return types. Procedures have typed parameters that act similarly to variables but are immutable.
Procedures always produce a mcfunction file. Inside the file, lines of commands referencing a parameter must start with `$`.

### Parameters
Parameters are stored under each Procedure `RegistryEntry` object.
A parameter is basically a scoped variable local to a specific procedure.

### Functions
> Deferred for now

### Data Flow
UI action → register in registry → registry triggers listeners subscribed to it → consumers of the registry listen for events and update accordingly

E.g.: User creates a new variable via a variable creation Editor → new variable entry registered in the variable registry → Variable Registry calls all subscribed listeners → `mc_var_get` and other variable blocks listens for the event → the blocks update their dropdown lists to show the new variable

## Data Registry
Static Minecraft data will be obtained via a local clone of [misode/mcmeta](https://github.com/misode/mcmeta/tree/registries).
A catalogue system will be used to asynchronously load chosen JSON files.

> Consider dynamic command Blocks generation using [misode/mcmeta/commands/data.json](https://github.com/misode/mcmeta/blob/summary/commands/data.json)

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
> Pending rework

Procedures are currently modeled as no-return reusable command chains.
Each procedure definition compiles to its own generated internal mcfunction file, and each call site emits a `function` call to that file.
Parameters are represented as explicit `mc_param` references inside the procedure body, and arguments at the call site are passed either inline for simple literal-like values or through temporary storage setup when indirection is needed.

For any block type accepted as an argument of a procedure, all inputs accepting that block type must also accept `mc_param`.

## Subsystem Status

### Main IDE Workspace `Complete`

### Code Editor (Blockly workspace) UX `In progress`

### File Output Preview UX `Complete`
- Consider adding syntax highlighting in the future.
- Consider adding jumping to source Block, but will require refactor of the Blockly compiler system.

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

### Project Configuration `In progress`
- Separate datapack configuration (namespace, display name, description, etc.) from project configuration (name mangling, optimization level, etc.)

### Asset Import/Referencing `Not started`

### Project Create/Save/Load `Complete`
- Add better save versioning later

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
- Conditional subcommands

Incomplete:
- Store subcommands

### Target Selector Helper `In progress`
- Currently Block-based, but should switch to Editor-based under `constructs` category.

### NBT Helper `Not started`

### Minecraft Data Types `In progress`
