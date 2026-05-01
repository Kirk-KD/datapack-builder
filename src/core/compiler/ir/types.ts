import * as Blockly from "blockly";
import {type IrNode, OnLoadNode, OnTickNode, ProcedureDefinitionNode, ProcedureParameterNode} from "./nodes.ts";

export type IrGenerator = (block: Blockly.Block) => IrNode

export type TopLevelNode = ProcedureDefinitionNode | OnLoadNode | OnTickNode
export type VariableOpType = '=' | '+=' | '-=' | '*=' | '/=' | '%='
export type OrParameter<T> = T | ProcedureParameterNode
