"use client"

import { DeleteWorkflow } from "@/actions/workflows/deleteWorkflow";
import { AlertDescription } from "@/components/ui/alert";
import {AlertDialogCancel, AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from "@/components/ui/alert-dialog"
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    workflowId: string
};

function DeleteWorkflowDialog({open, setOpen, workflowId}: Props) {
    const deleteMutation = useMutation({
        mutationFn: DeleteWorkflow,
        onSuccess: () => {
            toast.success("workflow deleted successfully", {id: workflowId});
        },
        onError: () => {
            toast.error("workflow could not be deleted.", {id: workflowId});
        },
    })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDescription>If you delete this workflow you will not be able to recover it.</AlertDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
                onClick={() => {
                    toast.loading("Deleting workflow...", {id: workflowId});
                    deleteMutation.mutate(workflowId);
                }}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteWorkflowDialog