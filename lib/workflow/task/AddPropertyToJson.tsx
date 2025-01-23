import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflowTypes";
import { DatabaseIcon, FileJson2Icon } from "lucide-react";

export const AddPropertyToJsonTask = {
    type: TaskType.ADD_PROPERTY_TO_JSON,
    label: "Add property to JSON",
    icon: (props) => {
        return <DatabaseIcon className="stroke-orange-400" {...props} />
    },
    isEntryPoint: false,
    inputs: [
        {
            name: "JSON",
            type: TaskParamType.STRING,
            required: true,
        },
        {
            name: "Property name",
            type: TaskParamType.STRING,
            required: true,
        },
        {
            name: "Property value",
            type: TaskParamType.STRING,
            required: true,
        },
    ] as const ,
    outputs: [{
        name: "Updated JSON",
        type: TaskParamType.STRING,
    }] as const,
} satisfies WorkflowTask;