import { FlowToExecutionPlan, FlowToExecutionPlanValidationError } from "@/lib/workflow/executionPlan";
import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import useFlowValidation from "./useFlowValidation";
import { toast } from "sonner";

type errorType = {
    type: FlowToExecutionPlanValidationError;
    invalidElements?: AppNodeMissingInputs[];
} | undefined;

const useExecutionPlan = () => {
    const { toObject } = useReactFlow();
    const { setInvalidInputs, clearErrors } = useFlowValidation();

    const handleError = useCallback(
        (error: errorType) => {
            if(error === undefined) {
                toast.error("something went wrong");
                return;
            }
            switch(error.type) {
                case FlowToExecutionPlanValidationError.NO_ENTRY_POINT:
                    toast.error("No entry point found");
                    break;
                case FlowToExecutionPlanValidationError.INVALID_INPUTS:
                    toast.error("Not all input vales are set");
                    setInvalidInputs(error.invalidElements || []);
                    break;
                default: 
                toast.error("something went wrong");
                break;
            }
        },
        [setInvalidInputs]
    );

    const generateExecutionPlan = useCallback(() => {
        const { nodes, edges } = toObject();
        const { executionPlan, error } = FlowToExecutionPlan(nodes as AppNode[], edges);

        if(error) {
            handleError(error);
            return null;
        }

        clearErrors();
        return executionPlan;
    }, [toObject, handleError, clearErrors]);
    
    return generateExecutionPlan;
};

export default useExecutionPlan;