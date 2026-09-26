"use client";
/**
 * The `[entryId]` edit page layout (docs/designs/app/pages/08-edit-entry.html),
 * shared by glucose, insulin, weight and measurement. Only the fields and the
 * context card change between them.
 */
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Lock, Trash2 } from "lucide-react";
import PopUpModal from "@/components/PopUpModal";
import { AppButton } from "./controls";
import { MobileCta, PageHeader, Panel, PanelHead, PanelTitle } from "./layout";

export function EditEntryShell({
    backHref,
    backLabel,
    title,
    subtitle,
    formId,
    onSubmit,
    isSubmitting,
    isLoading = false,
    noun,
    deleteDescription,
    onDelete,
    context,
    loggedAt,
    children,
}: {
    backHref: string;
    /** The list page's name, e.g. "Glucose". */
    backLabel: string;
    title: string;
    subtitle?: ReactNode;
    formId: string;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isSubmitting: boolean;
    isLoading?: boolean;
    /** What one entry is called: "reading", "dose", "weigh-in", "measurement". */
    noun: string;
    /** Repeats exactly what will be removed, e.g. "192 mg/dL · After meal · 26 Sep, 10:30". */
    deleteDescription?: ReactNode;
    onDelete: () => void;
    /** Optional card above "Entry details", e.g. the day's glucose curve. */
    context?: ReactNode;
    /** Formatted date the entry was logged for. */
    loggedAt?: ReactNode;
    children: ReactNode;
}) {
    return (
        <>
            <PageHeader
                breadcrumb={
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2">
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-1.5 font-semibold text-brand-aubergine no-underline"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            {backLabel}
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">{title}</span>
                    </nav>
                }
                title={title}
                subtitle={subtitle}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                <Panel
                    as="form"
                    id={formId}
                    onSubmit={onSubmit}
                    aria-label={title}
                    className="lg:col-span-8"
                >
                    {isLoading ? (
                        <div className="grid h-60 place-items-center">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-muted" />
                        </div>
                    ) : (
                        <div className="space-y-6">{children}</div>
                    )}

                    <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-border pt-6">
                        <PopUpModal
                            delete={onDelete}
                            title={`Delete this ${noun}?`}
                            description={
                                <>
                                    {deleteDescription}
                                    {deleteDescription && <br />}
                                    This can&apos;t be undone.
                                </>
                            }
                            trigger={
                                <AppButton variant="danger-outline" disabled={isSubmitting}>
                                    <Trash2 aria-hidden="true" />
                                    Delete {noun}
                                </AppButton>
                            }
                        />
                        <div className="hidden gap-3 lg:flex">
                            <AppButton variant="secondary" asChild>
                                <Link href={backHref}>Cancel</Link>
                            </AppButton>
                            <AppButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" aria-hidden="true" />
                                ) : (
                                    <Check aria-hidden="true" />
                                )}
                                Save changes
                            </AppButton>
                        </div>
                    </div>
                    <p className="mt-4 text-[13px] text-brand-muted">
                        Changes update your charts and stats straight away.
                    </p>
                </Panel>

                <div className="flex flex-col gap-4 lg:col-span-4 lg:gap-5">
                    {context}
                    <Panel>
                        <PanelHead>
                            <PanelTitle>Entry details</PanelTitle>
                        </PanelHead>
                        <dl className="m-0 text-sm [&>div+div]:mt-4 [&>div+div]:border-t [&>div+div]:border-border [&>div+div]:pt-4">
                            {loggedAt && (
                                <div className="flex justify-between gap-3">
                                    <dt className="text-brand-muted">Logged for</dt>
                                    <dd className="m-0 text-right">{loggedAt}</dd>
                                </div>
                            )}
                            <div className="flex justify-between gap-3">
                                <dt className="text-brand-muted">Stored</dt>
                                <dd className="m-0 inline-flex items-center gap-2">
                                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                    Encrypted at rest
                                </dd>
                            </div>
                        </dl>
                    </Panel>
                </div>
            </div>

            <MobileCta>
                <AppButton
                    type="submit"
                    form={formId}
                    size="lg"
                    block
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                        <Check aria-hidden="true" />
                    )}
                    Save changes
                </AppButton>
            </MobileCta>
        </>
    );
}
