import { TaskParamType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflowTypes";
import { Link2Icon } from "lucide-react";

export const NavigateUrlTask = {
    type: TaskType.NAVIGATE_URL,
    label: "Navigate URL",
    icon: (props) => {
        return <Link2Icon className="stroke-orange-400" {...props} />
    },
    isEntryPoint: false,
    inputs: [
        {
            name: "Web page",
            type: TaskParamType.BROWSER_INSTANCE,
            required: true,
        },
        {
            name: "URL",
            type: TaskParamType.STRING,
            required: true,
        }
    ] as const ,
    outputs: [{
        name: "Web Page",
        type: TaskParamType.BROWSER_INSTANCE,
    }] as const,
} satisfies WorkflowTask;