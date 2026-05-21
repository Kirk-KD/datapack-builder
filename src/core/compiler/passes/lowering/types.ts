import {CommandNode, IrNode} from '../../ir'

/**
 * The result of a lowering pass visit on an IR node. Contains the transformed nodes
 * and any commands that must be inserted before them in the nearest enclosing command
 * list.
 *
 * `pre` exists because some nodes produce setup commands as a side effect of
 * lowering. For example, a VariableCompareNode with a literal right side must
 * initialize a temp scoreboard variable before the command that uses it.
 * Since commands cannot be inserted inside expressions, they are carried upward
 * through the tree via `pre` until they reach a command list that can consume them.
 *
 * ## Rules for implementing `IrVisitor<LoweredResult>`:
 *
 * **If a node visits CommandNode children (body lists):**
 * Call `lowerBody()` on the list. This is the only place `pre` is consumed;
 * each command's `pre` is inserted immediately before that command in the result.
 *
 * **If a node visits non-CommandNode children (conditions, fragments, clauses):**
 * Collect their `pre` and bubble it upward via this node's own `LoweredResult.pre`.
 * It cannot be consumed here because there is no command list to insert into.
 *
 * **If a node has no children:**
 * Return `{ pre: [], nodes: [node] }`: nothing to visit, nothing to hoist.
 *
 * `pre` must never be silently dropped. If a visit method calls `accept()` on any
 * child, it is responsible for either consuming or forwarding that child's `pre`.
 */
export interface LoweredResult {
  pre: CommandNode[]
  nodes: IrNode[]
}
