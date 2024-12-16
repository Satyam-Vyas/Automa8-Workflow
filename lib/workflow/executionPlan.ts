import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflowTypes"
import { TaskRegistry } from "./task/registry";
import { Edge } from "@xyflow/react";

export enum FlowToExecutionPlanValidationError {
    "NO_ENTRY_POINT",
    "INVALID_INPUTS",
};

type FlowToExecutionPlanType = {
    executionPlan?: WorkflowExecutionPlan;
    error?: {
        type: FlowToExecutionPlanValidationError,
        invalidElements?: AppNodeMissingInputs[],
    }
};

export function FlowToExecutionPlan(
    nodes: AppNode[],
    edges: Edge[]
): FlowToExecutionPlanType {
    const entryPoint = nodes.find(
        (node) => TaskRegistry[node.data.type].isEntryPoint
    );

    if(!entryPoint) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.NO_ENTRY_POINT,
            },
        };
    }

    const inputsWithErrors: AppNodeMissingInputs[] = [];
    const planned = new Set<string>();
    const invalidInputs = getInvalidInputs(entryPoint, edges, planned);
    if(invalidInputs?.length > 0) {
        inputsWithErrors.push({
            nodeId: entryPoint.id,
            inputs: invalidInputs,
        });
    }

    const executionPlan: WorkflowExecutionPlan = [{
        phase: 1,
        nodes: [entryPoint]
    }];
    planned.add(entryPoint.id);

    for (let phase = 2; phase <= nodes.length && planned.size < nodes.length; phase++) {
        const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] };
        for(const currentNode of nodes) {
            if(planned.has(currentNode.id)) {
                // Node already put in the execution plan
                continue;
            }

            const invalidInputs = getInvalidInputs(currentNode, edges, planned);
            if(invalidInputs.length > 0) {
                const incomers = getIncomers(currentNode, nodes, edges);
                if(incomers.every((incomer) => planned.has(incomer.id))) {
                    // if all incoming edges are planned and there are still invalid inputs
                    // this means that this particular node has an invalid input
                    // which means that the workflow is invalid
                    console.error("invalid inputs", currentNode.id, invalidInputs);
                    inputsWithErrors.push({
                        nodeId: currentNode.id,
                        inputs: invalidInputs,
                    });
                } else {
                    continue;
                }
            }
            nextPhase.nodes.push(currentNode);
        }
        for(const node of nextPhase.nodes) {
            planned.add(node.id);
        }
        executionPlan.push(nextPhase);
    }

    if(inputsWithErrors.length > 0) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.INVALID_INPUTS,
                invalidElements: inputsWithErrors,
            },
        };
    }
    return { executionPlan };
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
    const invalidInputs = [];
    const inputs = TaskRegistry[node.data.type].inputs;
    for(const input of inputs) {
        const inputValue = node.data.inputs[input.name];
        const inputValueProvided = inputValue?.length > 0;
        if(inputValueProvided) {
            continue;
        }

        // if a value is not provided by the user then we need to check 
        // if there is an output linked to the current input
        const incomingEdges = edges.filter((edge) => edge.target === node.id);

        const inputLinkedToOutput = incomingEdges.find(
            (edge) => edge.targetHandle === input.name
        );

        const requiredInputProvidedByOutput = input.required &&
        inputLinkedToOutput &&
        planned.has(inputLinkedToOutput.source);

        if(requiredInputProvidedByOutput) {
            // the input is required and we have a valid value for it
            // provided by a task that is already planned
            continue;
        } else if(!input.required) {
            // if the input is not required but an output is linked to it
            // we need to ensure that the output is planned
            if(!inputLinkedToOutput) continue;
            if(inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
                continue;
            }
        }
        invalidInputs.push(input.name);
    }
    return invalidInputs;
}

function getIncomers(node: AppNode, nodes: AppNode[], edges: Edge[]) {
    if (!node.id) {
        return [];
    }
    const incomersIds = new Set();
    edges.forEach((edge) => {
    if (edge.target === node.id) {
        incomersIds.add(edge.source);
    }
    });

    return nodes.filter((n) => incomersIds.has(n.id));
}