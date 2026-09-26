"use client";
/**
 * The list pages' primary action ("Log glucose", "Log dose", …). The add form
 * opens in a dialog from the page header on desktop and from the bottom bar
 * on phones, so the page itself can lead with the reading and history.
 */
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AppButton } from "./controls";
import { MobileCta } from "./layout";

export function useLogEntryDialog(openInitially = false) {
    // `useQuickLog` resolves after hydration, so follow it until the user
    // opens or closes the dialog themselves.
    const [choice, setOpen] = useState<boolean | null>(null);
    return { open: choice ?? openInitially, setOpen };
}

/** The header button. Hidden on phones, where <LogEntryCta> takes over. */
export function LogEntryButton({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <AppButton onClick={onClick} className="hidden lg:inline-flex">
            <Plus className="icon-spin" aria-hidden="true" />
            {label}
        </AppButton>
    );
}

/** The same action pinned to the bottom of the screen below `lg`. */
export function LogEntryCta({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <MobileCta>
            <AppButton size="lg" block onClick={onClick}>
                <Plus className="icon-spin" aria-hidden="true" />
                {label}
            </AppButton>
        </MobileCta>
    );
}

export function LogEntryDialog({
    open,
    onOpenChange,
    title,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[min(480px,calc(100%-32px))]"
                aria-describedby={undefined}
            >
                <div className="p-6">
                    <DialogTitle className="mb-5 pr-8">{title}</DialogTitle>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
