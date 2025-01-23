import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflowTypes";
import { ArrowUpIcon, MousePointerClick } from "lucide-react";

export const ScrollToELementTask = {
    type: TaskType.SCROLL_TO_ELEMENT,
    label: "Scroll to element",
    icon: (props) => {
        return <ArrowUpIcon className="stroke-orange-400" {...props} />
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