"use client";
import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AppButton, iconButton } from "@/components/app-ui/controls";
import { cn } from "@/lib/utils";

/**
 * Delete confirmation. The trigger is a red icon button by default; pass
 * `trigger` for a labelled button instead (the edit pages do).
 */
export default function PopUpModal(props: {
    delete: () => void;
    /** Content of the default icon trigger. */
    buttonContent?: ReactNode;
    /** Replaces the default trigger entirely. Must be a single button element. */
    trigger?: ReactNode;
    title?: ReactNode;
    /** Say exactly what will be removed, e.g. "126 mg/dL · After meal · 26 Sep 14:40". */
    description?: ReactNode;
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {props.trigger ?? (
                    <button
                        type="button"
                        aria-label="Delete"
                        className={cn(
                            iconButton({ tone: "danger", size: "sm" }),
                            props.className
                        )}
                    >
                        {props.buttonContent ?? <Trash2 aria-hidden="true" />}
                    </button>
                )}
            </DialogTrigger>
            <DialogContent hideClose>
                <div className="px-6 pt-7 pb-6 text-center">
                    <span className="mb-4 inline-grid h-[52px] w-[52px] place-items-center rounded-full bg-status-low-bg text-status-low">
                        <Trash2 className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <DialogTitle className="mb-2">
                        {props.title ?? "Delete this entry?"}
                    </DialogTitle>
                    <DialogDescription>
                        {props.description ?? "This can't be undone."}
                    </DialogDescription>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <AppButton variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </AppButton>
                        <AppButton
                            variant="danger"
                            onClick={() => {
                                props.delete();
                                setOpen(false);
                            }}
                        >
                            Delete
                        </AppButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
