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

## Subsystem Status

### Main IDE Workspace `Not started`

### Code Editor (Blockly workspace) UX `Not started`

### File Output Preview UX `Not started`

### Block Definition System `In progress`

Complete:
- JSON-based block definition
- JSON-based toolbox category definition

Incomplete:
- Complete OOP design for block system based on functionality types
- One object per block, handling its own definition, code generation, and any extensions

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
