# Directories

## `src/core/`

Houses subsystems without any knowledge of the UI components. The UI components should consume from `core/` in order to
perform functions.

Each subfolder under `core/` corresponds to one subsystem, each having their own `index.ts` barrel file.

## `src/data/`

Data such as sprites and JSON files.

## `src/stores/`

Houses zustand stores. Currently only project config.

## `src/ui/`

UI elements. Each subfolder corresponds to one UI system, such as `editor/` and `ide/`. The `components/` subdirectory
houses common general components usable throughout the app, not specific to any UI system.

# Handling request for project breakdown

When receiving a request for a complete project summary, it must be detailed and you must not skip any details.
The summary should be limited to `src/`, but you must ignore `src/data/` for its massive size.
You must not skip and files, folders, functions, classes, types, interfaces, TODOs, etc. except `src/data/`.

You must identify issues both marked by the developer and those that you discover.

You must make suggestions on and point out potentially fragile code design.

You must generate a `project_summary_<DATE>_<TIME>.md` file at the end, and place it in `scripts/` (not the root directory or the `src/` directory).

# Rules

When completing coding tasks, you must not generate summary/documentation `md` files unless explicitly instructed by the user.

When completing coding tasks, and when you need to create new functionalities, check first whether an appropriate 
solution exists in the project. If not, proceed with new function creation. Otherwise, assess whether using or extending
existing solution is appropriate, and proceed accordingly. New functions and files should cover its own intended functionality,
avoid one function handling multiple purposes.
