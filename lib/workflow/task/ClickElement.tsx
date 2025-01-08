import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflowTypes";
import { MousePointerClick } from "lucide-react";

export const ClickElementTask = {
    type: TaskType.CLICK_ELEMENT,
    label: "Click Element",
    icon: (props) => {
        return <MousePointerClick className="stroke-orange-400" {...props} />
    },
    isEntryPoint: false,
    inputs: [
        {
            name: "Web page",
            type: TaskParamType.BROWSER_INSTANCE,
            required: true,
        },
        {
            name: "Selector",
            type: TaskParamType.STRING,
            required: true,
        }
    ] as const ,
    outputs: [{
        name: "Web Page",
        type: TaskParamType.BROWSER_INSTANCE,
    }] as const,
} satisfies WorkflowTask;