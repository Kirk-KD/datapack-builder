import * as Blockly from "blockly";
import {type IrNode, OnLoadNode, OnTickNode, ProcedureDefinitionNode, ProcedureParameterNode} from "./nodes.ts";

export type IrGeneratorFunction = (block: Blockly.Block) => IrNode

export type TopLevelNode = ProcedureDefinitionNode | OnLoadNode | OnTickNode
export type VariableCompareOpType = '<' | '<=' | '=' | '>=' | '>'
export type VariableOpType = '+=' | '-=' | '*=' | '/=' | '%='
export type OrParameter<T> = T | ProcedureParameterNode
