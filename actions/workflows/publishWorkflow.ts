"use server"

import prisma from "@/lib/prisma";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { WorkflowStatus } from "@/types/workflowTypes";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function PublishWorkflow({id, flowDefinition}: {
    id: string;
    flowDefinition: string;
}) {
    const { userId } = await auth();
    if(!userId) {
        throw new Error("unauthenticated");
    }
    
    const workflow = await prisma.workflow.findUnique({
        where: {
            id, 
            userId
        },
    });

    if(!workflow) {
        throw new Error("workflow not found");
    }

    if(workflow.status !== WorkflowStatus.DRAFT) {
        throw new Error("workflow is not a draft");
    }

    const flow = JSON.parse(flowDefinition);
    const result = FlowToExecutionPlan(flow.nodes, flow.edges);
    if(result.error) {
        throw new Error("flow definition not valid");
    }

    if(!result.executionPlan) {
        throw new Error("no execution plan generated");
    }

    await prisma.workflow.update({
        where: {
            id,
            userId,
        },
        data: {
            definition: flowDefinition,
            executionPlan: JSON.stringify(result.executionPlan),
            status: WorkflowStatus.PUBLISHED,
        },
    });

    revalidatePath(`/workflow/editor/${id}`);
}