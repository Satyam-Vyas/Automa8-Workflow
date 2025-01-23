"use client"
import { DeleteCredential } from "@/actions/credentials/deleteCredential";
import { AlertDescription } from "@/components/ui/alert";
import {AlertDialogCancel, AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    name: string;
};

function DeleteCredentialDialog({name}: Props) {
    const [open, setOpen] = useState(false);
    const deleteMutation = useMutation({
        mutationFn: DeleteCredential,
        onSuccess: () => {
            toast.success("Credential deleted successfully", {id: name});
        },
        onError: () => {
            toast.error("Credential could not be deleted.", {id: name});
        },
    })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
            <Button variant={"destructive"} size={"icon"}>
                <XIcon size={18}/>
            </Button>
        </ AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDescription>If you delete this credential you will not be able to recover it.</AlertDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
                onClick={() => {
                    toast.loading("Deleting credential...", {id: name});
                    deleteMutation.mutate(name);
                }}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCredentialDialog